begin;
create table public.em_csv_licences (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 licence_id uuid not null references public.em_licences(id) on delete cascade,
 auth_code text not null,
 valid_until date not null,
 checked_at timestamptz not null default now()
);
alter table public.em_csv_licences enable row level security;
revoke all on public.em_csv_licences from anon,authenticated;
create function public.my_csv_licence_context() returns jsonb language sql stable security definer set search_path=public as $$
 select jsonb_build_object('key',c.auth_code) from public.em_individual_members m
 join public.em_licences l on l.id=m.licence_id
 left join public.em_csv_licences c on c.user_id=m.user_id and c.licence_id=m.licence_id
 where m.user_id=auth.uid() and l.kind='individual';
$$;
create function public.record_csv_licence(p_user_id uuid,p_key text,p_until date) returns void
language plpgsql security definer set search_path=public as $$
declare lid uuid;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Server verification required'; end if;
 select m.licence_id into lid from public.em_individual_members m join public.em_licences l on l.id=m.licence_id where m.user_id=p_user_id and l.kind='individual';
 if lid is null or p_key is null or btrim(p_key)='' or p_until is null then raise exception 'Individual licence not found'; end if;
 insert into public.em_csv_licences(user_id,licence_id,auth_code,valid_until,checked_at) values(p_user_id,lid,upper(btrim(p_key)),p_until,now())
 on conflict(user_id) do update set licence_id=excluded.licence_id,auth_code=excluded.auth_code,valid_until=excluded.valid_until,checked_at=now();
end $$;
create function public.activate_csv_individual_session(p_device text) returns void
language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); sid uuid:=(auth.jwt()->>'session_id')::uuid; lic public.em_licences; device text:=lower(btrim(p_device));
begin
 if uid is null or sid is null then raise exception 'Sign in first'; end if;
 select l.* into lic from public.em_individual_members m join public.em_licences l on l.id=m.licence_id where m.user_id=uid and l.kind='individual' for update of l;
 if not found or lic.status<>'active' or lic.valid_from>public.em_india_today() then raise exception 'This individual licence is not active'; end if;
 if not exists(select 1 from public.profiles where id=uid and is_active) then raise exception 'This account is inactive'; end if;
 if not exists(select 1 from public.em_csv_licences c where c.user_id=uid and c.licence_id=lic.id and c.valid_until>=public.em_india_today() and c.checked_at>now()-interval '30 seconds') then raise exception 'Verify the licence sheet first'; end if;
 if public.trustgate_required() then
  if device is null or device !~ '^[a-z0-9][a-z0-9._:-]{7,79}$' then raise exception 'Open the companion app on this computer'; end if;
  if not exists(select 1 from public.em_individual_devices where user_id=uid) and not lic.accepting_devices then raise exception 'Device registration is closed'; end if;
  insert into public.em_individual_devices(user_id,device_id) values(uid,device) on conflict(user_id) do nothing;
  if not exists(select 1 from public.em_individual_devices where user_id=uid and device_id=device) then raise exception 'This account is registered on another computer. Ask Super Admin to reset its device'; end if;
 end if;
 insert into public.em_individual_sessions(session_id,user_id,licence_id) values(sid,uid,lic.id) on conflict(session_id) do nothing;
end $$;
create or replace function public.individual_sign_in_gate() returns jsonb
language plpgsql stable security definer set search_path=public as $$
declare lic public.em_licences; uid uuid:=auth.uid();
begin
 select l.* into lic from public.em_individual_members m join public.em_licences l on l.id=m.licence_id where m.user_id=uid and l.kind='individual';
 if not found then return public.individual_licence_standing(); end if;
 if lic.status<>'active' or lic.valid_from>public.em_india_today() or not exists(select 1 from public.em_csv_licences c where c.user_id=uid and c.licence_id=lic.id and c.valid_until>=public.em_india_today()) then return jsonb_build_object('ok',false,'kind','individual','reason','closed'); end if;
 if not exists(select 1 from public.em_individual_sessions where user_id=uid and licence_id=lic.id and session_id=(auth.jwt()->>'session_id')::uuid) then return jsonb_build_object('ok',false,'kind','individual','reason','activation'); end if;
 return jsonb_build_object('ok',true,'kind','individual');
end $$;
create or replace function public.my_individual_validity() returns jsonb language sql stable security definer set search_path=public as $$
 select jsonb_build_object('valid_until',c.valid_until) from public.em_csv_licences c join public.em_individual_members m on m.user_id=c.user_id and m.licence_id=c.licence_id where c.user_id=auth.uid();
$$;
-- Local generated keys no longer activate individual access.
do $$
begin
 if to_regprocedure('public.activate_individual_session(text,text)') is not null then
  execute 'revoke all on function public.activate_individual_session(text,text) from authenticated';
 end if;
 if to_regprocedure('public.resume_individual_session(text)') is not null then
  execute 'revoke all on function public.resume_individual_session(text) from authenticated';
 end if;
end $$;
revoke all on function public.record_csv_licence(uuid,text,date),public.my_csv_licence_context(),public.activate_csv_individual_session(text) from public;
grant execute on function public.record_csv_licence(uuid,text,date) to service_role;
grant execute on function public.my_csv_licence_context(),public.activate_csv_individual_session(text) to authenticated;
commit;
