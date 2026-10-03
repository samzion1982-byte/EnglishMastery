begin;
-- Persist validation per account and licence, never in browser storage.
create table public.em_individual_key_validations (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 licence_id uuid not null references public.em_licences(id) on delete cascade,
 key_hash text not null
);
alter table public.em_individual_key_validations enable row level security;
-- Existing activated sessions have already validated their licence key.
insert into public.em_individual_key_validations(user_id,licence_id,key_hash)
 select distinct s.user_id,s.licence_id,encode(extensions.digest(l.licence_key,'sha256'),'hex')
 from public.em_individual_sessions s join public.em_licences l on l.id=s.licence_id
 join public.em_individual_members m on m.user_id=s.user_id and m.licence_id=s.licence_id
 where l.kind='individual' and l.licence_key is not null
 on conflict(user_id) do nothing;
alter function public.activate_individual_session(text,text) rename to activate_individual_checked;
revoke all on function public.activate_individual_checked(text,text) from public,anon,authenticated;
create function public.activate_individual_session(p_key text,p_device text) returns void
language plpgsql security definer set search_path=public as $$
declare lic public.em_licences;
begin
 perform public.activate_individual_checked(p_key,p_device);
 select l.* into lic from public.em_individual_members m join public.em_licences l on l.id=m.licence_id where m.user_id=auth.uid() and l.kind='individual';
 insert into public.em_individual_key_validations(user_id,licence_id,key_hash)
 values(auth.uid(),lic.id,encode(extensions.digest(upper(btrim(p_key)),'sha256'),'hex'))
 on conflict(user_id) do update set licence_id=excluded.licence_id,key_hash=excluded.key_hash;
end $$;
create function public.resume_individual_session(p_device text) returns boolean
language plpgsql security definer set search_path=public as $$
declare lic public.em_licences;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 select l.* into lic from public.em_individual_members m join public.em_licences l on l.id=m.licence_id where m.user_id=auth.uid() and l.kind='individual';
 if not found then raise exception 'This account has no individual licence'; end if;
 if lic.status<>'active' or lic.valid_from>public.em_india_today() or (lic.valid_until is not null and lic.valid_until<public.em_india_today()) then raise exception 'This individual licence is not active'; end if;
 if not exists(select 1 from public.em_individual_key_validations v where v.user_id=auth.uid() and v.licence_id=lic.id and v.key_hash=encode(extensions.digest(lic.licence_key,'sha256'),'hex')) then return false; end if;
 -- Recheck TrustGate, registered device, account standing and licence dates.
 perform public.activate_individual_checked(lic.licence_key,p_device);
 return true;
end $$;
revoke all on function public.activate_individual_session(text,text),public.resume_individual_session(text) from public;
grant execute on function public.activate_individual_session(text,text),public.resume_individual_session(text) to authenticated;
commit;
