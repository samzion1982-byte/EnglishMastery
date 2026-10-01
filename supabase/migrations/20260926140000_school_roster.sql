-- School id, class roster from the yearly tracker, and join-link registrations.
-- A school's seat count is the number of roster rows. Run after 20260926130000_licences.sql.

alter table public.em_licences add column if not exists school_code text;

alter table public.em_licences drop constraint if exists em_licences_seats_check;
alter table public.em_licences
  add constraint em_licences_seats_check check (seats between 0 and 20000);

create unique index if not exists em_licences_school_code_uidx
  on public.em_licences (upper(school_code))
  where school_code is not null;

create table if not exists public.em_roster (
  id uuid primary key default gen_random_uuid(),
  licence_id uuid not null references public.em_licences (id) on delete cascade,
  admission_no text not null,
  student_name text not null,
  standard_label text not null,
  section_label text not null,
  source text not null default 'tracker',
  created_at timestamptz not null default now(),
  constraint em_roster_source_check check (source in ('tracker', 'manual')),
  constraint em_roster_admission_check check (admission_no ~ '^[A-Z0-9][A-Z0-9./-]{1,39}$'),
  constraint em_roster_name_check check (char_length(btrim(student_name)) between 1 and 160),
  constraint em_roster_standard_check check (standard_label ~ '^(XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)$'),
  constraint em_roster_section_check check (section_label ~ '^[A-Z]$'),
  unique (licence_id, admission_no)
);

create index if not exists em_roster_class_idx
  on public.em_roster (licence_id, standard_label, section_label);

create table if not exists public.em_device_registrations (
  id uuid primary key default gen_random_uuid(),
  licence_id uuid not null references public.em_licences (id) on delete cascade,
  admission_no text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint em_device_registrations_status_check check (status in ('pending', 'approved', 'rejected')),
  constraint em_device_registrations_admission_check check (admission_no ~ '^[A-Z0-9][A-Z0-9./-]{1,39}$'),
  unique (licence_id, admission_no)
);

alter table public.em_roster enable row level security;
alter table public.em_device_registrations enable row level security;

drop policy if exists em_roster_super_admin on public.em_roster;
create policy em_roster_super_admin on public.em_roster
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists em_registrations_super_admin on public.em_device_registrations;
create policy em_registrations_super_admin on public.em_device_registrations
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant select, insert, update, delete on public.em_roster to authenticated;
grant select, insert, update, delete on public.em_device_registrations to authenticated;

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

  update public.em_licences set seats = n where id = p_licence_id;
  return jsonb_build_object('seats', n);
end;
$$;

create or replace function public.add_school_student(
  p_licence_id uuid,
  p_admission text,
  p_name text,
  p_standard text,
  p_section text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  admission text := upper(btrim(p_admission));
  pupil_name text := btrim(p_name);
  std text := upper(btrim(p_standard));
  sec text := upper(btrim(p_section));
  moved boolean;
  n int;
begin
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
  end if;
  if not exists (select 1 from public.em_licences where id = p_licence_id and kind = 'school') then
    raise exception 'School licence not found';
  end if;
  if admission !~ '^[A-Z0-9][A-Z0-9./-]{1,39}$' then
    raise exception 'Invalid admission number';
  end if;
  if char_length(pupil_name) < 1 or char_length(pupil_name) > 160 then
    raise exception 'Enter the student name';
  end if;
  if std !~ '^(XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)$' then
    raise exception 'Invalid standard';
  end if;
  if sec !~ '^[A-Z]$' then
    raise exception 'Invalid section';
  end if;

  moved := exists (
    select 1 from public.em_roster where licence_id = p_licence_id and admission_no = admission
  );

  insert into public.em_roster (licence_id, admission_no, student_name, standard_label, section_label, source)
  values (p_licence_id, admission, pupil_name, std, sec, 'manual')
  on conflict (licence_id, admission_no) do update
  set student_name = excluded.student_name,
      standard_label = excluded.standard_label,
      section_label = excluded.section_label,
      source = 'manual';

  select count(*) into n from public.em_roster where licence_id = p_licence_id;
  update public.em_licences set seats = n where id = p_licence_id;
  return jsonb_build_object('moved', moved, 'seats', n);
end;
$$;

create or replace function public.school_join_info(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  lic public.em_licences;
  open_now boolean;
begin
  select * into lic
  from public.em_licences
  where kind = 'school' and school_code is not null and upper(school_code) = upper(btrim(p_code))
  limit 1;
  if not found then
    return jsonb_build_object('ok', false);
  end if;
  open_now := lic.status = 'active'
    and lic.accepting_devices
    and lic.valid_from <= current_date
    and (lic.valid_until is null or lic.valid_until >= current_date);
  return jsonb_build_object('ok', true, 'name', lic.name, 'open', open_now);
end;
$$;

create or replace function public.join_school(p_code text, p_admission text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  lic public.em_licences;
  pupil public.em_roster;
  reg public.em_device_registrations;
  admission text := upper(btrim(p_admission));
begin
  select * into lic
  from public.em_licences
  where kind = 'school' and school_code is not null and upper(school_code) = upper(btrim(p_code))
  limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'unknown_school');
  end if;
  if lic.status <> 'active'
     or not lic.accepting_devices
     or lic.valid_from > current_date
     or (lic.valid_until is not null and lic.valid_until < current_date) then
    return jsonb_build_object('ok', false, 'reason', 'closed', 'school', lic.name);
  end if;
  if admission !~ '^[A-Z0-9][A-Z0-9./-]{1,39}$' then
    return jsonb_build_object('ok', false, 'reason', 'unknown_student', 'school', lic.name);
  end if;

  select * into pupil
  from public.em_roster
  where licence_id = lic.id and admission_no = admission;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'unknown_student', 'school', lic.name);
  end if;

  select * into reg
  from public.em_device_registrations
  where licence_id = lic.id and admission_no = admission;
  if found then
    return jsonb_build_object(
      'ok', true,
      'reason', reg.status,
      'school', lic.name,
      'name', pupil.student_name,
      'class_label', pupil.standard_label || '-' || pupil.section_label
    );
  end if;

  insert into public.em_device_registrations (licence_id, admission_no, status)
  values (lic.id, admission, 'pending');

  return jsonb_build_object(
    'ok', true,
    'reason', 'pending',
    'school', lic.name,
    'name', pupil.student_name,
    'class_label', pupil.standard_label || '-' || pupil.section_label
  );
end;
$$;

revoke all on function public.apply_school_roster(uuid, jsonb) from public;
revoke all on function public.add_school_student(uuid, text, text, text, text) from public;
revoke all on function public.school_join_info(text) from public;
revoke all on function public.join_school(text, text) from public;

grant execute on function public.apply_school_roster(uuid, jsonb) to authenticated;
grant execute on function public.add_school_student(uuid, text, text, text, text) to authenticated;
grant execute on function public.school_join_info(text) to anon, authenticated;
grant execute on function public.join_school(text, text) to anon, authenticated;
