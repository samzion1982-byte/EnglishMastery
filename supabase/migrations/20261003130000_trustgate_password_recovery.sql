begin;
-- Stop before any changes when the prerequisite migration has not completed.
do $$
begin
 if to_regprocedure('public.activate_individual_session(text,text)') is null
    or to_regclass('public.em_individual_sessions') is null
    or to_regclass('public.em_individual_devices') is null then
  raise exception 'Missing individual-account setup. Run 20261003120000_individual_accounts.sql successfully before this migration.';
 end if;
end $$;
-- Global individual TrustGate policy and explicitly authorised password recovery.
create table public.em_auth_settings(id boolean primary key default true check(id),require_trustgate boolean not null default true);
insert into public.em_auth_settings values(true,true);
alter table public.em_auth_settings enable row level security;
create function public.trustgate_required() returns boolean language sql stable security definer set search_path=public as $$ select require_trustgate from public.em_auth_settings where id=true $$;
create function public.set_trustgate_required(p_required boolean) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_super_admin() then raise exception 'Super Admin required'; end if;
 if p_required is null then raise exception 'Choose on or off'; end if;
 update public.em_auth_settings set require_trustgate=p_required where id=true;
 -- Re-enable requires every individual session to activate on its registered device.
 if p_required then delete from public.em_individual_sessions where session_id is not null; end if;
end $$;

-- Replace activation, retaining key and licence validation with the gate disabled.
alter function public.activate_individual_session(text,text) rename to activate_individual_with_device;
revoke all on function public.activate_individual_with_device(text,text) from public,authenticated;
create function public.activate_individual_session(p_key text,p_device text) returns void language plpgsql security definer set search_path=public as $$
declare lic public.em_licences; uid uuid:=auth.uid(); sid uuid:=(auth.jwt()->>'session_id')::uuid;
begin
 if public.trustgate_required() then perform public.activate_individual_with_device(p_key,p_device); return; end if;
 if uid is null or sid is null then raise exception 'Sign in first'; end if;
 select l.* into lic from public.em_licences l join public.em_individual_members m on m.licence_id=l.id where m.user_id=uid and l.kind='individual';
 if not found or lic.licence_key is distinct from upper(btrim(p_key)) then raise exception 'The licence key does not match this account'; end if;
 if lic.status<>'active' or lic.valid_from>public.em_india_today() or (lic.valid_until is not null and lic.valid_until<public.em_india_today()) then raise exception 'This individual licence is not active'; end if;
 if not exists(select 1 from public.profiles where id=uid and is_active) then raise exception 'This account is inactive'; end if;
 insert into public.em_individual_sessions(session_id,user_id,licence_id) values(sid,uid,lic.id) on conflict(session_id) do nothing;
end $$;

create schema if not exists em_private;
revoke all on schema em_private from public,anon,authenticated;
create table em_private.password_key(id boolean primary key check(id),secret text not null);
insert into em_private.password_key values(true,encode(extensions.gen_random_bytes(32),'hex'));
create table em_private.individual_passwords(user_id uuid primary key references auth.users(id) on delete cascade,cipher bytea not null,password_hash text not null);
revoke all on all tables in schema em_private from public,anon,authenticated;

create function em_private.store_password(p_uid uuid,p_password text) returns void language plpgsql security definer set search_path=public as $$
begin
 insert into em_private.individual_passwords(user_id,cipher,password_hash)
 select p_uid,extensions.pgp_sym_encrypt(p_password,k.secret),u.encrypted_password from em_private.password_key k,auth.users u where k.id=true and u.id=p_uid
 on conflict(user_id) do update set cipher=excluded.cipher,password_hash=excluded.password_hash;
end $$;
revoke all on function em_private.store_password(uuid,text) from public,anon,authenticated;

-- Invalidate recoverable copies when another password path changes the hash.
create function em_private.password_changed() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.encrypted_password is distinct from old.encrypted_password then
  delete from em_private.individual_passwords where user_id=new.id;
  if exists(select 1 from public.em_individual_members where user_id=new.id) and new.encrypted_password=extensions.crypt('123456',new.encrypted_password) then perform em_private.store_password(new.id,'123456'); end if;
 end if;
 return new;
end $$;
revoke all on function em_private.password_changed() from public,anon,authenticated;
create trigger em_individual_password_changed after update of encrypted_password on auth.users for each row execute function em_private.password_changed();
create function em_private.member_password() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if exists(select 1 from auth.users where id=new.user_id and encrypted_password=extensions.crypt('123456',encrypted_password)) then perform em_private.store_password(new.user_id,'123456'); end if;
 return new;
end $$;
revoke all on function em_private.member_password() from public,anon,authenticated;
create trigger em_member_password after insert on public.em_individual_members for each row execute function em_private.member_password();
-- Only known default passwords can be recovered retroactively.
select em_private.store_password(u.id,'123456') from auth.users u join public.em_individual_members m on m.user_id=u.id where u.encrypted_password=extensions.crypt('123456',u.encrypted_password);

create function public.set_account_password(p_password text) returns void language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'Sign in or open the recovery link first'; end if;
 if p_password is null or length(p_password)<6 or length(p_password)>72 or octet_length(p_password)>72 or p_password='123456' then raise exception 'Choose a new password of 6 to 72 bytes'; end if;
 update auth.users set encrypted_password=extensions.crypt(p_password,extensions.gen_salt('bf')),updated_at=now() where id=uid;
 if exists(select 1 from public.em_individual_members where user_id=uid) then perform em_private.store_password(uid,p_password); end if;
 update public.profiles set must_change_password=false where id=uid;
end $$;
create function public.view_individual_password(p_user_id uuid) returns text language plpgsql security definer set search_path=public as $$
declare result text; lid uuid;
begin
 if not public.is_super_admin() then raise exception 'Super Admin required'; end if;
 select licence_id into lid from public.em_individual_members where user_id=p_user_id;
 if lid is null then raise exception 'Individual account not found'; end if;
 select extensions.pgp_sym_decrypt(p.cipher,k.secret) into result from em_private.individual_passwords p join auth.users u on u.id=p.user_id and u.encrypted_password=p.password_hash cross join em_private.password_key k where p.user_id=p_user_id and k.id=true;
 perform public.em_log_licence_event(lid,'password_view','Super Admin viewed password for '||p_user_id::text);
 return result;
end $$;
revoke all on function public.trustgate_required(),public.set_trustgate_required(boolean),public.activate_individual_session(text,text),public.set_account_password(text),public.view_individual_password(uuid) from public;
grant execute on function public.trustgate_required() to anon,authenticated;
grant execute on function public.set_trustgate_required(boolean),public.activate_individual_session(text,text),public.set_account_password(text),public.view_individual_password(uuid) to authenticated;

commit;
