-- A principal manages staff at their own school the same way Super Admin does.
-- Run this once in the Supabase SQL editor, then open Staff again.

alter table public.em_school_staff add column if not exists active boolean not null default true;

create or replace function public.em_principal_of(p_licence_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.em_school_staff
    where user_id = auth.uid()
      and licence_id = p_licence_id
      and designation = 'principal'
      and coalesce(active, true)
  );
$$;

revoke all on function public.em_principal_of(uuid) from public, anon, authenticated;

drop function if exists public.list_my_school_staff();

create or replace function public.list_my_school_staff()
returns table (
  id uuid,
  user_id uuid,
  staff_name text,
  designation text,
  email text,
  rank_level int,
  sort_no int,
  active boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.user_id, s.staff_name, s.designation, s.email, s.rank_level, s.sort_no, coalesce(s.active, true)
  from public.em_school_staff s
  where s.licence_id = (
    select me.licence_id
    from public.em_school_staff me
    where me.user_id = auth.uid()
      and me.designation = 'principal'
      and coalesce(me.active, true)
    limit 1
  )
  order by s.sort_no;
$$;

revoke all on function public.list_my_school_staff() from public;
grant execute on function public.list_my_school_staff() to authenticated;

create or replace function public.add_school_staff(
  p_licence_id uuid,
  p_name text,
  p_designation text,
  p_email text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  person_name text;
  post text;
  mail text;
  lvl int;
  staff_role text;
  login jsonb;
  uid uuid;
  ord int;
  new_id uuid;
begin
  if not public.is_super_admin() and not public.em_principal_of(p_licence_id) then
    raise exception 'Principal access required';
  end if;
  if not exists (select 1 from public.em_licences where id = p_licence_id and kind = 'school') then
    raise exception 'School licence not found';
  end if;

  person_name := regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g');
  post := lower(btrim(coalesce(p_designation, '')));
  mail := lower(regexp_replace(btrim(coalesce(p_email, '')), '\s+', '', 'g'));
  lvl := case post
    when 'principal' then 4
    when 'hod' then 3
    when 'teacher' then 2
    when 'tutor' then 1
    else null
  end;

  if char_length(person_name) < 1 or char_length(person_name) > 160 then
    raise exception 'Each staff member needs a name';
  end if;
  if lvl is null then
    raise exception 'Unknown designation for %', person_name;
  end if;
  if mail !~ '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' or char_length(mail) > 160 then
    raise exception 'Enter a valid email for %', person_name;
  end if;
  if exists (
    select 1 from public.em_school_staff
    where licence_id = p_licence_id and lower(staff_name) = lower(person_name)
  ) then
    raise exception 'Duplicate name: %', person_name;
  end if;
  if exists (
    select 1 from public.em_school_staff
    where licence_id = p_licence_id and lower(email) = mail
  ) then
    raise exception 'Duplicate email: %', mail;
  end if;

  staff_role := case when post = 'principal' then 'school_admin' else 'teacher' end;
  login := public.em_ensure_staff_login(p_licence_id, mail, person_name, staff_role);
  uid := (login->>'id')::uuid;

  select coalesce(max(sort_no), 0) + 1 into ord
  from public.em_school_staff
  where licence_id = p_licence_id;

  insert into public.em_school_staff (licence_id, staff_name, designation, email, rank_level, sort_no, user_id, active)
  values (p_licence_id, person_name, post, mail, lvl, ord, uid, true)
  returning id into new_id;

  perform public.em_log_licence_event(p_licence_id, 'staff', 'Added ' || person_name);
  return new_id;
end;
$$;

revoke all on function public.add_school_staff(uuid, text, text, text) from public;
grant execute on function public.add_school_staff(uuid, text, text, text) to authenticated;

create or replace function public.set_school_staff_active(p_licence_id uuid, p_staff_id uuid, p_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
begin
  if not public.is_super_admin() and not public.em_principal_of(p_licence_id) then
    raise exception 'Principal access required';
  end if;
  select user_id into uid
  from public.em_school_staff
  where id = p_staff_id and licence_id = p_licence_id;
  if not found then
    raise exception 'That staff member is not on this school';
  end if;
  if uid = auth.uid() and not public.is_super_admin() then
    raise exception 'Keep your own sign-in active';
  end if;
  update public.em_school_staff
  set active = p_active
  where id = p_staff_id and licence_id = p_licence_id;
  if uid is not null then
    update public.profiles set is_active = p_active where id = uid;
  end if;
end;
$$;

revoke all on function public.set_school_staff_active(uuid, uuid, boolean) from public;
grant execute on function public.set_school_staff_active(uuid, uuid, boolean) to authenticated;

create or replace function public.delete_school_staff(p_licence_id uuid, p_staff_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
begin
  if not public.is_super_admin() and not public.em_principal_of(p_licence_id) then
    raise exception 'Principal access required';
  end if;
  select user_id into uid
  from public.em_school_staff
  where id = p_staff_id and licence_id = p_licence_id;
  if not found then
    raise exception 'That staff member is not on this school';
  end if;
  if uid = auth.uid() and not public.is_super_admin() then
    raise exception 'Keep your own sign-in';
  end if;
  if uid is not null then
    update public.profiles set is_active = false where id = uid;
  end if;
  delete from public.em_school_staff where id = p_staff_id and licence_id = p_licence_id;
end;
$$;

revoke all on function public.delete_school_staff(uuid, uuid) from public;
grant execute on function public.delete_school_staff(uuid, uuid) to authenticated;

create or replace function public.reset_school_staff_password(p_licence_id uuid, p_staff_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid uuid;
  stay_active boolean;
  hashed text;
begin
  if not public.is_super_admin() and not public.em_principal_of(p_licence_id) then
    raise exception 'Principal access required';
  end if;
  select user_id, active into uid, stay_active
  from public.em_school_staff
  where id = p_staff_id and licence_id = p_licence_id;
  if uid is null then
    raise exception 'That staff sign-in is not ready. Save an email for this person first.';
  end if;
  begin
    hashed := extensions.crypt('123456', extensions.gen_salt('bf'));
  exception
    when undefined_function then
      hashed := crypt('123456', gen_salt('bf'));
  end;
  update auth.users set encrypted_password = hashed, updated_at = now() where id = uid;
  update public.profiles
  set must_change_password = true,
      is_active = coalesce(stay_active, true)
  where id = uid;
end;
$$;

revoke all on function public.reset_school_staff_password(uuid, uuid) from public;
grant execute on function public.reset_school_staff_password(uuid, uuid) to authenticated;

create or replace function public.update_school_staff(
  p_licence_id uuid,
  p_staff_id uuid,
  p_name text,
  p_designation text,
  p_email text,
  p_level int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  old_mail text;
  person_name text;
  post text;
  mail text;
  staff_role text;
  login jsonb;
begin
  if not public.is_super_admin() and not public.em_principal_of(p_licence_id) then
    raise exception 'Principal access required';
  end if;
  select user_id, lower(email) into uid, old_mail
  from public.em_school_staff
  where id = p_staff_id and licence_id = p_licence_id;
  if not found then
    raise exception 'That staff member is not on this school';
  end if;
  person_name := regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g');
  post := lower(btrim(coalesce(p_designation, '')));
  mail := lower(regexp_replace(btrim(coalesce(p_email, '')), '\s+', '', 'g'));
  if uid = auth.uid() and post <> 'principal' and not public.is_super_admin() then
    raise exception 'Keep your own designation as principal';
  end if;
  if char_length(person_name) < 1 or char_length(person_name) > 160 then
    raise exception 'Each staff member needs a name';
  end if;
  if post not in ('principal', 'hod', 'teacher', 'tutor') then
    raise exception 'Unknown designation for %', person_name;
  end if;
  if (post = 'principal' and p_level <> 4)
     or (post = 'hod' and p_level <> 3)
     or (post = 'teacher' and p_level <> 2)
     or (post = 'tutor' and p_level <> 1) then
    raise exception 'Level does not match the designation for %', person_name;
  end if;
  if mail !~ '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' or char_length(mail) > 160 then
    raise exception 'Enter a valid email for %', person_name;
  end if;
  if exists (
    select 1 from public.em_school_staff
    where licence_id = p_licence_id and id <> p_staff_id and lower(staff_name) = lower(person_name)
  ) then
    raise exception 'Duplicate name: %', person_name;
  end if;
  if exists (
    select 1 from public.em_school_staff
    where licence_id = p_licence_id and id <> p_staff_id and lower(email) = mail
  ) then
    raise exception 'Duplicate email: %', mail;
  end if;
  staff_role := case when post = 'principal' then 'school_admin' else 'teacher' end;
  if uid is null then
    login := public.em_ensure_staff_login(p_licence_id, mail, person_name, staff_role);
    uid := (login->>'id')::uuid;
  else
    if mail is distinct from old_mail then
      if exists (select 1 from auth.users where lower(email) = mail and id <> uid) then
        raise exception 'That email already belongs to another account: %', mail;
      end if;
      update auth.users set email = mail, updated_at = now() where id = uid;
      update auth.identities
      set provider_id = mail,
          identity_data = jsonb_set(coalesce(identity_data, '{}'::jsonb), '{email}', to_jsonb(mail), true)
      where user_id = uid and provider = 'email';
    end if;
    update public.profiles
    set display_name = person_name, email = mail, role = staff_role
    where id = uid;
  end if;
  update public.em_school_staff
  set staff_name = person_name,
      designation = post,
      email = mail,
      rank_level = p_level,
      user_id = uid
  where id = p_staff_id and licence_id = p_licence_id;
end;
$$;

revoke all on function public.update_school_staff(uuid, uuid, text, text, text, int) from public;
grant execute on function public.update_school_staff(uuid, uuid, text, text, text, int) to authenticated;
