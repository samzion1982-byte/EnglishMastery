-- User management (CMS-style slots) + first-login password flag.
-- Licence checks are not enforced in the app yet.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in (
    'super_admin', 'admin1', 'admin', 'user', 'demo', 'user4',
    'student', 'parent', 'teacher', 'school_admin'
  ));

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists nickname text;
alter table public.profiles add column if not exists is_active boolean not null default true;
alter table public.profiles add column if not exists must_change_password boolean not null default false;

create unique index if not exists profiles_email_lower_uidx
  on public.profiles (lower(email)) where email is not null;

create table if not exists public.em_role_page_access (
  role text not null,
  page_key text not null,
  allowed boolean not null default false,
  primary key (role, page_key)
);

insert into public.app_modules (slug, title, description, sort_order, is_enabled)
values
  ('users', 'Users', 'Create students and admin staff. Super Admin only.', 80, true),
  ('permissions', 'Permissions', 'Page access per admin role. Super Admin only.', 90, true)
on conflict (slug) do nothing;

insert into public.em_role_page_access (role, page_key, allowed)
values
  ('admin1', 'core-vocabulary', true),
  ('admin', 'core-vocabulary', true),
  ('user', 'core-vocabulary', true),
  ('demo', 'core-vocabulary', true),
  ('user4', 'core-vocabulary', true)
on conflict (role, page_key) do nothing;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin' and is_active is distinct from false
  );
$$;

create or replace function public.is_admin_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_active is distinct from false
      and role in ('super_admin', 'admin1', 'admin', 'user', 'demo', 'user4')
  );
$$;

drop policy if exists em_grants_read on public.em_role_page_access;
create policy em_grants_read on public.em_role_page_access
  for select to authenticated
  using (public.is_admin_staff());

drop policy if exists em_grants_admin on public.em_role_page_access;
create policy em_grants_admin on public.em_role_page_access
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

alter table public.em_role_page_access enable row level security;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.em_role_page_access to authenticated;

-- Super Admin is set here, never from signup metadata.
insert into public.profiles (id, role, display_name, nickname, email, mother_tongue, is_active, must_change_password)
select
  u.id,
  'super_admin',
  coalesce(split_part(u.email, '@', 1), 'Sam'),
  'Sam',
  u.email,
  'en',
  true,
  false
from auth.users u
where lower(u.email) = lower('samzion1982@gmail.com')
on conflict (id) do update
set
  role = 'super_admin',
  nickname = 'Sam',
  email = excluded.email,
  is_active = true,
  must_change_password = false;

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and is_active = (select p.is_active from public.profiles p where p.id = auth.uid())
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name, email, mother_tongue, is_active, must_change_password)
  values (
    new.id,
    'student',
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1)),
    new.email,
    'en',
    true,
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
