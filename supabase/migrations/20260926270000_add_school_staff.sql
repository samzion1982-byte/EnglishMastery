-- Add one staff member to a school without replacing the list.
-- Run this once after 20260926230000_school_staff_controls.sql.

alter table public.em_school_staff add column if not exists active boolean not null default true;

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
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
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
