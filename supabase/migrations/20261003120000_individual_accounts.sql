begin;
-- Individual accounts and session activation. Passwords remain hashed.
alter table public.em_licences add column if not exists licence_key text;
update public.em_licences set licence_key=upper(encode(extensions.gen_random_bytes(16),'hex')) where kind='individual' and licence_key is null;
create unique index em_licence_key_unique on public.em_licences(licence_key) where licence_key is not null;
create table public.em_individual_devices(user_id uuid primary key references public.profiles(id) on delete cascade, device_id text not null);
create table public.em_individual_sessions(session_id uuid primary key,user_id uuid not null references public.profiles(id) on delete cascade,licence_id uuid not null references public.em_licences(id) on delete cascade);
alter table public.em_individual_devices enable row level security;
alter table public.em_individual_sessions enable row level security;
create function public.provision_individual_learner(p_licence_id uuid,p_email text,p_name text,p_role text default 'student') returns uuid language plpgsql security definer set search_path=public as $$
declare uid uuid; mail text:=lower(btrim(p_email)); lic public.em_licences;
begin
 if not public.is_super_admin() then raise exception 'Super Admin required'; end if;
 if p_role is null or p_role not in ('student','admin1','user4','demo','user','admin') then raise exception 'Invalid access level'; end if;
 if mail is null or mail !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then raise exception 'A valid learner email is required'; end if;
 select * into lic from public.em_licences where id=p_licence_id and kind='individual' for update;
 if not found then raise exception 'Individual licence not found'; end if;
 if exists(select 1 from auth.users where lower(email)=mail) then raise exception 'That email already has an account. Assign the existing learner instead.'; end if;
 if (select count(*) from public.em_individual_members where licence_id=lic.id)>=lic.seats then raise exception 'This licence has no free seats'; end if;
 uid:=gen_random_uuid();
 insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
 values('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',mail,extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}'::jsonb,jsonb_build_object('display_name',btrim(p_name)),now(),now(),'','','','');
 insert into auth.identities(id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
 values(gen_random_uuid(),uid,jsonb_build_object('sub',uid::text,'email',mail,'email_verified',true),'email',uid::text,now(),now(),now());
 insert into public.profiles(id,email,display_name,role,is_active,must_change_password) values(uid,mail,btrim(p_name),p_role,true,true)
 on conflict(id) do update set email=excluded.email,display_name=excluded.display_name,role=excluded.role,is_active=true,must_change_password=true;
 insert into public.em_individual_members(licence_id,user_id) values(lic.id,uid);
 perform public.em_log_licence_event(lic.id,'learner','Created '||mail||' as '||p_role);
 return uid;
end $$;
create function public.create_individual_account(p_details jsonb,p_role text default 'student') returns uuid language plpgsql security definer set search_path=public as $$
declare lid uuid;
begin
 if not public.is_super_admin() then raise exception 'Super Admin required'; end if;
 insert into public.em_licences(kind,name,contact_email,seats,valid_from,valid_until,status,accepting_devices,second_device_policy,licence_key)
 values('individual',p_details->>'name',lower(btrim(p_details->>'contact_email')),(p_details->>'seats')::int,(p_details->>'valid_from')::date,(p_details->>'valid_until')::date,p_details->>'status',(p_details->>'accepting_devices')::boolean,'refuse',upper(encode(extensions.gen_random_bytes(16),'hex'))) returning id into lid;
 perform public.provision_individual_learner(lid,p_details->>'contact_email',p_details->>'name',p_role);
 return lid;
end $$;
create function public.activate_individual_session(p_key text,p_device text) returns void language plpgsql security definer set search_path=public as $$
declare lic public.em_licences; uid uuid:=auth.uid(); sid uuid:=(auth.jwt()->>'session_id')::uuid; device text:=lower(btrim(p_device));
begin
 if uid is null or sid is null then raise exception 'Sign in first'; end if;
 if device is null or device !~ '^[a-z0-9][a-z0-9._:-]{7,79}$' then raise exception 'Open the companion app on this computer'; end if;
 select l.* into lic from public.em_licences l join public.em_individual_members m on m.licence_id=l.id where m.user_id=uid and l.kind='individual' for update of l;
 if not found or lic.licence_key is distinct from upper(btrim(p_key)) then raise exception 'The licence key does not match this account'; end if;
 if lic.status<>'active' or lic.valid_from>public.em_india_today() or (lic.valid_until is not null and lic.valid_until<public.em_india_today()) then raise exception 'This individual licence is not active'; end if;
 if not exists(select 1 from public.profiles where id=uid and is_active) then raise exception 'This account is inactive'; end if;
 if not exists(select 1 from public.em_individual_devices where user_id=uid) and not lic.accepting_devices then raise exception 'Device registration is closed'; end if;
 insert into public.em_individual_devices(user_id,device_id) values(uid,device) on conflict(user_id) do nothing;
 if not exists(select 1 from public.em_individual_devices where user_id=uid and device_id=device) then raise exception 'This account is registered on another computer. Ask Super Admin to reset its device'; end if;
 insert into public.em_individual_sessions(session_id,user_id,licence_id) values(sid,uid,lic.id) on conflict(session_id) do nothing;
end $$;
alter function public.individual_sign_in_gate() rename to individual_licence_standing;
revoke all on function public.individual_licence_standing() from public,authenticated;
create function public.individual_sign_in_gate() returns jsonb language plpgsql stable security definer set search_path=public as $$
declare result jsonb; lid uuid;
begin
 result:=public.individual_licence_standing();
 select licence_id into lid from public.em_individual_members where user_id=auth.uid();
 if lid is not null then
  result:=result || jsonb_build_object('kind','individual');
  if not (result->>'ok')::boolean then return result; end if;
  if not exists(select 1 from public.em_individual_sessions where session_id=(auth.jwt()->>'session_id')::uuid and user_id=auth.uid() and licence_id=lid) then return jsonb_build_object('ok',false,'kind','individual','reason','activation'); end if;
 end if;
 return result;
end $$;
create function public.reset_individual_access(p_licence_id uuid,p_user_id uuid,p_device boolean default false) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_super_admin() then raise exception 'Super Admin required'; end if;
 if not exists(select 1 from public.em_individual_members where licence_id=p_licence_id and user_id=p_user_id) then raise exception 'Learner not found'; end if;
 if p_device then delete from public.em_individual_devices where user_id=p_user_id;
 else
  update auth.users set encrypted_password=extensions.crypt('123456',extensions.gen_salt('bf')),updated_at=now() where id=p_user_id;
  update public.profiles set must_change_password=true where id=p_user_id;
 end if;
 delete from public.em_individual_sessions where user_id=p_user_id;
 perform public.em_log_licence_event(p_licence_id,'recovery',case when p_device then 'Reset device' else 'Reset temporary password' end);
end $$;
revoke all on function public.provision_individual_learner(uuid,text,text,text),public.create_individual_account(jsonb,text),public.activate_individual_session(text,text),public.individual_sign_in_gate(),public.reset_individual_access(uuid,uuid,boolean) from public;
grant execute on function public.provision_individual_learner(uuid,text,text,text),public.create_individual_account(jsonb,text),public.activate_individual_session(text,text),public.individual_sign_in_gate(),public.reset_individual_access(uuid,uuid,boolean) to authenticated;

create function public.verify_individual_device(p_device text) returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.em_individual_devices d
 join public.em_individual_sessions s on s.user_id=d.user_id
 where d.user_id=auth.uid() and d.device_id=lower(btrim(p_device))
 and s.session_id=(auth.jwt()->>'session_id')::uuid)
 and coalesce((public.individual_sign_in_gate()->>'ok')::boolean,false);
$$;
revoke all on function public.verify_individual_device(text) from public;
grant execute on function public.verify_individual_device(text) to authenticated;

commit;
