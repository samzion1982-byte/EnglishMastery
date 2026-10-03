-- User session logs: server timestamps and identity, one live row per auth session.
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

create or replace function public.touch_login_session(p_user_agent text default null, p_end boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare
 sid uuid := nullif(auth.jwt()->>'session_id','')::uuid;
 person public.profiles%rowtype;
 live public.em_login_logs%rowtype;
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
  insert into public.em_login_logs(auth_session_id,user_id,full_name,email,user_role,user_agent)
  values(sid,auth.uid(),coalesce(nullif(person.display_name,''),person.email,'User'),
   coalesce(person.email,auth.jwt()->>'email',''),person.role,left(p_user_agent,512));
 else
  update public.em_login_logs set last_seen_at=now() where id=live.id;
 end if;
end;
$$;

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
