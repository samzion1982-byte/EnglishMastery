-- Disable or delete a student, and delete a school with its sign-ins.
-- Run this once in the Supabase SQL editor.

alter table public.em_roster add column if not exists active boolean not null default true;

create or replace function public.apply_school_roster(p_licence_id uuid, p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
  n int;
  admission text;
  pupil_name text;
  std text;
  sec text;
  seen text[] := array[]::text[];
begin
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
  end if;
  if not exists (select 1 from public.em_licences where id = p_licence_id and kind = 'school') then
    raise exception 'School licence not found';
  end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'Roster must be a list';
  end if;
  n := jsonb_array_length(p_rows);
  if n < 1 or n > 20000 then
    raise exception 'Roster must contain between 1 and 20000 students';
  end if;

  for rec in select item from jsonb_array_elements(p_rows) as t(item)
  loop
    admission := upper(btrim(rec.item->>'admission_no'));
    pupil_name := btrim(rec.item->>'student_name');
    std := upper(btrim(rec.item->>'standard_label'));
    sec := upper(btrim(rec.item->>'section_label'));
    if admission !~ '^[A-Z0-9][A-Z0-9./-]{1,39}$' then
      raise exception 'Invalid admission number: %', coalesce(rec.item->>'admission_no', '');
    end if;
    if char_length(pupil_name) < 1 or char_length(pupil_name) > 160 then
      raise exception 'Each student needs a name';
    end if;
    if std !~ '^(XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)$' then
      raise exception 'Invalid standard: %', coalesce(std, '');
    end if;
    if sec !~ '^[A-Z]$' then
      raise exception 'Invalid section: %', coalesce(sec, '');
    end if;
    if admission = any (seen) then
      raise exception 'Duplicate admission number: %', admission;
    end if;
    seen := array_append(seen, admission);
  end loop;

  create temp table if not exists _em_device_limits (admission_no text primary key, device_limit int) on commit drop;
  truncate _em_device_limits;
  insert into _em_device_limits (admission_no, device_limit)
  select admission_no, device_limit
  from public.em_roster
  where licence_id = p_licence_id and device_limit > 1;

  create temp table if not exists _em_inactive (admission_no text primary key) on commit drop;
  truncate _em_inactive;
  insert into _em_inactive (admission_no)
  select admission_no
  from public.em_roster
  where licence_id = p_licence_id and active = false;

  delete from public.em_roster where licence_id = p_licence_id;

  insert into public.em_roster (licence_id, admission_no, student_name, standard_label, section_label, source)
  select
    p_licence_id,
    upper(btrim(value->>'admission_no')),
    btrim(value->>'student_name'),
    upper(btrim(value->>'standard_label')),
    upper(btrim(value->>'section_label')),
    'tracker'
  from jsonb_array_elements(p_rows);

  update public.em_roster as roster
  set device_limit = kept.device_limit
  from _em_device_limits as kept
  where roster.licence_id = p_licence_id and roster.admission_no = kept.admission_no;

  update public.em_roster as roster
  set active = false
  from _em_inactive as kept
  where roster.licence_id = p_licence_id and roster.admission_no = kept.admission_no;

  update public.em_licences set seats = n where id = p_licence_id;
  return jsonb_build_object('seats', n);
end;
$$;

create or replace function public.set_school_student_active(p_licence_id uuid, p_admission text, p_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  admission text := upper(btrim(p_admission));
  uid uuid;
begin
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
  end if;
  update public.em_roster
  set active = p_active
  where licence_id = p_licence_id and admission_no = admission
  returning user_id into uid;
  if not found then
    raise exception 'Student not found';
  end if;
  if uid is not null then
    update public.profiles set is_active = p_active where id = uid;
  end if;
end;
$$;

create or replace function public.delete_school_student(p_licence_id uuid, p_admission text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  admission text := upper(btrim(p_admission));
  uid uuid;
  n int;
begin
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
  end if;
  select user_id into uid
  from public.em_roster
  where licence_id = p_licence_id and admission_no = admission;
  if not found then
    raise exception 'Student not found';
  end if;
  delete from public.em_device_registrations
  where licence_id = p_licence_id and admission_no = admission;
  delete from public.em_roster
  where licence_id = p_licence_id and admission_no = admission;
  if uid is not null then
    delete from auth.users where id = uid;
  end if;
  select count(*) into n from public.em_roster where licence_id = p_licence_id;
  update public.em_licences set seats = n where id = p_licence_id;
end;
$$;

create or replace function public.delete_school(p_licence_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
begin
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
  end if;
  if not exists (select 1 from public.em_licences where id = p_licence_id and kind = 'school') then
    raise exception 'School licence not found';
  end if;
  for uid in
    select user_id from public.em_roster
    where licence_id = p_licence_id and user_id is not null
  loop
    delete from auth.users where id = uid;
  end loop;
  delete from public.em_licences where id = p_licence_id;
end;
$$;

revoke all on function public.set_school_student_active(uuid, text, boolean) from public;
revoke all on function public.delete_school_student(uuid, text) from public;
revoke all on function public.delete_school(uuid) from public;
grant execute on function public.set_school_student_active(uuid, text, boolean) to authenticated;
grant execute on function public.delete_school_student(uuid, text) to authenticated;
grant execute on function public.delete_school(uuid) to authenticated;

do $$
declare
  src text;
  patched text;
begin
  src := pg_get_functiondef('public.join_school(text,text,text,text)'::regprocedure);
  if position('pupil.active' in src) > 0 then
    return;
  end if;
  patched := replace(
    src,
    'approved_exists := exists (',
    'if not coalesce(pupil.active, true) then return jsonb_build_object(''ok'', false, ''reason'', ''inactive'', ''school'', lic.name); end if; approved_exists := exists ('
  );
  if patched = src then
    raise warning 'join_school was not updated for disabled students';
  else
    execute patched;
  end if;
end $$;

do $$
declare
  src text;
  mark text := 'if not found or pupil.login_email is null then';
  extra text := 'if not found or pupil.login_email is null or not coalesce(pupil.active, true) then';
begin
  src := pg_get_functiondef('public.student_pin_login(text,text)'::regprocedure);
  if position(mark in src) > 0 and position('pupil.active' in src) = 0 then
    execute replace(src, mark, extra);
  end if;
end $$;
