-- Complete login-logs setup, including the base table. Safe to rerun; existing logs are preserved.
begin;
create table if not exists public.em_login_logs (
 id uuid primary key default gen_random_uuid(),
 auth_session_id uuid not null,
 user_id uuid references auth.users(id) on delete set null,
 full_name text not null, email text not null, user_role text not null,
 user_agent text,
 login_at timestamptz not null default now(),
 last_seen_at timestamptz not null default now(),
 logout_at timestamptz,
 end_reason text check (end_reason in ('signout','timeout'))
);
create index if not exists em_login_logs_recent on public.em_login_logs(login_at desc);
create unique index if not exists em_login_logs_live on public.em_login_logs(auth_session_id) where logout_at is null;
alter table public.em_login_logs enable row level security;
revoke all on public.em_login_logs from anon, authenticated;

create or replace function public.em_has_page_access(p_key text)
returns boolean language sql stable security definer set search_path = public as $$
 select exists (
  select 1 from public.profiles p
  left join public.em_school_staff s on s.user_id = p.id and coalesce(s.active, true)
  left join public.em_role_page_access g on g.page_key = p_key and g.role =
   case s.designation when 'principal' then 'user4' when 'hod' then 'demo'
    when 'teacher' then 'user' when 'tutor' then 'admin' else p.role end
  where p.id = auth.uid() and p.is_active is distinct from false
   and (p.role = 'super_admin' or (p_key not in ('permissions','licences')
    and p.role in ('admin1','user4','demo','user','admin','teacher','school_admin')
    and coalesce(g.allowed, p.role = 'admin1')))
 );
$$;
revoke all on function public.em_has_page_access(text) from public;
grant execute on function public.em_has_page_access(text) to authenticated;


alter table public.em_login_logs add column if not exists account_kind text not null default 'unknown'
 check(account_kind in ('individual','school','console','unknown'));
alter table public.em_login_logs add column if not exists school_group text check(school_group in ('student','staff'));
alter table public.em_login_logs add column if not exists school_name text;
alter table public.em_login_logs add column if not exists trustgate_mode text not null default 'unknown'
 check(trustgate_mode in ('on','bypass','unknown'));
alter table public.em_individual_sessions add column if not exists trustgate_mode text
 check(trustgate_mode in ('on','bypass'));
-- Existing rows retain Unknown: old authentication settings cannot be reconstructed.
create or replace function public.activate_csv_individual_session(p_device text) returns void
language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); sid uuid:=(auth.jwt()->>'session_id')::uuid; lic public.em_licences; device text:=lower(btrim(p_device)); required boolean:=public.trustgate_required();
begin
 if uid is null or sid is null then raise exception 'Sign in first'; end if;
 select l.* into lic from public.em_individual_members m join public.em_licences l on l.id=m.licence_id where m.user_id=uid and l.kind='individual' for update of l;
 if not found or lic.status<>'active' or lic.valid_from>public.em_india_today() then raise exception 'This individual licence is not active'; end if;
 if not exists(select 1 from public.profiles where id=uid and is_active) then raise exception 'This account is inactive'; end if;
 if not exists(select 1 from public.em_csv_licences c where c.user_id=uid and c.licence_id=lic.id and c.valid_until>=public.em_india_today() and c.checked_at>now()-interval '30 seconds') then raise exception 'Verify the licence sheet first'; end if;
 if required then
  if device is null or device !~ '^[a-z0-9][a-z0-9._:-]{7,79}$' then raise exception 'Open the companion app on this computer'; end if;
  if not exists(select 1 from public.em_individual_devices where user_id=uid and device_id=device) then
   if not lic.accepting_devices then raise exception 'Device registration is closed'; end if;
   if (select count(*) from public.em_individual_devices where user_id=uid)>=lic.device_limit then
    raise exception 'The allowed number of devices has been reached. Ask Super Admin to reset devices or increase the limit.';
   end if;
   insert into public.em_individual_devices(user_id,device_id) values(uid,device);
  end if;
 end if;
 insert into public.em_individual_sessions(session_id,user_id,licence_id,trustgate_mode) values(sid,uid,lic.id,case when required then 'on' else 'bypass' end) on conflict(session_id) do nothing;
end $$;
create or replace function public.touch_login_session(p_user_agent text default null, p_end boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare
 sid uuid := nullif(auth.jwt()->>'session_id','')::uuid;
 person public.profiles%rowtype;
 live public.em_login_logs%rowtype;
 kind text := 'console';
 group_name text;
 school_label text;
 gate_mode text := 'bypass';
 lid uuid;
begin
 if auth.uid() is null or sid is null then raise exception 'Sign in required'; end if;
 select * into person from public.profiles where id = auth.uid();
 if not found or person.is_active is false then raise exception 'Active account required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(sid::text, 0));
 select * into live from public.em_login_logs where auth_session_id=sid and logout_at is null for update;
 if found and (p_end or live.last_seen_at < now()-interval '90 seconds') then
  update public.em_login_logs set logout_at=case when p_end then now() else last_seen_at end,
   last_seen_at=case when p_end then now() else last_seen_at end,
   end_reason=case when p_end then 'signout' else 'timeout' end where id=live.id;
  live.id := null;
 end if;
 if p_end then return; end if;
 if live.id is null then
  select m.licence_id into lid from public.em_individual_members m
   join public.em_licences l on l.id=m.licence_id where m.user_id=auth.uid() and l.kind='individual' limit 1;
  if found then
   kind := 'individual';
   select coalesce(s.trustgate_mode,'unknown') into gate_mode from public.em_individual_sessions s
    where s.session_id=sid and s.user_id=auth.uid();
   gate_mode := coalesce(gate_mode,'unknown');
  else
   select l.name into school_label from public.em_school_staff s join public.em_licences l on l.id=s.licence_id
    where s.user_id=auth.uid() limit 1;
   if found then kind := 'school'; group_name := 'staff';
   else
    select l.name into school_label from public.em_roster r join public.em_licences l on l.id=r.licence_id
     where r.user_id=auth.uid() limit 1;
    if found then
     kind := 'school'; group_name := 'student'; gate_mode := 'unknown';
     select coalesce(old.trustgate_mode,'unknown') into gate_mode from public.em_login_logs old
      where old.auth_session_id=sid and old.trustgate_mode='on' order by old.login_at desc limit 1;
     gate_mode := coalesce(gate_mode,'unknown');
    end if;
   end if;
  end if;
  insert into public.em_login_logs(auth_session_id,user_id,full_name,email,user_role,user_agent,account_kind,school_group,school_name,trustgate_mode)
  values(sid,auth.uid(),coalesce(nullif(person.display_name,''),person.email,'User'),
   coalesce(person.email,auth.jwt()->>'email',''),person.role,left(p_user_agent,512),kind,group_name,school_label,gate_mode);
 else
  update public.em_login_logs set last_seen_at=now() where id=live.id;
 end if;
end;
$$;


-- Called only after school PIN authentication. Recheck approved device and authenticated identity.
create or replace function public.record_school_login_session(p_device text, p_user_agent text default null)
returns void language plpgsql security definer set search_path=public as $$
declare result jsonb; sid uuid := nullif(auth.jwt()->>'session_id','')::uuid;
begin
 if auth.uid() is null or sid is null then raise exception 'Sign in required'; end if;
 result := public.student_pin_login(p_device,'123456');
 if result->>'ok' is distinct from 'true' or lower(result->>'email') is distinct from lower(auth.jwt()->>'email')
  or not exists(select 1 from public.em_roster where user_id=auth.uid()) then
  raise exception 'Approved school device required';
 end if;
 perform public.touch_login_session(p_user_agent,false);
 update public.em_login_logs set trustgate_mode='on'
  where auth_session_id=sid and user_id=auth.uid() and logout_at is null and account_kind='school' and school_group='student';
end;
$$;
revoke all on function public.record_school_login_session(text,text) from public;
grant execute on function public.record_school_login_session(text,text) to authenticated;
create or replace function public.login_session_rows()
returns setof public.em_login_logs language plpgsql stable security definer set search_path = public as $$
begin
 if not public.em_has_page_access('logs') then raise exception 'Logs permission required'; end if;
 return query select * from public.em_login_logs where login_at >= now()-interval '31 days'
  order by login_at desc limit 1000;
end;
$$;
revoke all on function public.touch_login_session(text,boolean) from public;
revoke all on function public.login_session_rows() from public;
grant execute on function public.touch_login_session(text,boolean) to authenticated;
grant execute on function public.login_session_rows() to authenticated;
commit;
