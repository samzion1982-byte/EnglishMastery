-- Full school licence setup. Run this once in the Supabase SQL editor.
-- It creates the licence register, the class roster, one-device rules, and student PIN sign-in.
-- Safe to run after any of the earlier files in this set; it does not drop student rows.
-- Super Admin licence register for schools and individual families.
-- Seat limits and status are recorded here. The student app does not enforce them yet.

create table if not exists public.em_licences (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  name text not null,
  contact_email text,
  seats int not null default 1,
  valid_from date not null default current_date,
  valid_until date,
  status text not null default 'active',
  accepting_devices boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint em_licences_kind_check check (kind in ('school', 'individual')),
  constraint em_licences_status_check check (status in ('active', 'suspended')),
  constraint em_licences_seats_check check (seats between 0 and 20000),
  constraint em_licences_name_check check (char_length(btrim(name)) between 1 and 160),
  constraint em_licences_dates_check check (valid_until is null or valid_until >= valid_from)
);

create index if not exists em_licences_kind_name_idx on public.em_licences (kind, lower(name));

create or replace function public.touch_em_licences()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists em_licences_touch on public.em_licences;
create trigger em_licences_touch
  before update on public.em_licences
  for each row execute procedure public.touch_em_licences();

alter table public.em_licences enable row level security;

drop policy if exists em_licences_super_admin on public.em_licences;
create policy em_licences_super_admin on public.em_licences
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant select, insert, update, delete on public.em_licences to authenticated;


-- School id, class roster from the yearly tracker, and join-link registrations.
-- A school's seat count is the number of roster rows. Run after 20260926130000_licences.sql.

alter table public.em_licences add column if not exists school_code text;
alter table public.em_licences add column if not exists academic_year text;

alter table public.em_licences drop constraint if exists em_licences_academic_year_check;
alter table public.em_licences
  add constraint em_licences_academic_year_check
  check (
    academic_year is null
    or (
      academic_year ~ '^20[0-9]{2}-[0-9]{2}$'
      and right(academic_year, 2)::int = (left(academic_year, 4)::int + 1) % 100
    )
  );

create or replace function public.em_india_today()
returns date
language sql
stable
as $$
  select (timezone('Asia/Kolkata', now()))::date;
$$;

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
    and lic.valid_from <= public.em_india_today()
    and (lic.valid_until is null or lic.valid_until >= public.em_india_today());
  return jsonb_build_object(
    'ok', true,
    'name', lic.name,
    'open', open_now,
    'reason', case
      when lic.status <> 'active' then 'suspended'
      when not lic.accepting_devices then 'blocked'
      when lic.valid_from > public.em_india_today() then 'not_started'
      when lic.valid_until is not null and lic.valid_until < public.em_india_today() then 'ended'
      else null
    end,
    'starts', lic.valid_from
  );
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
     or lic.valid_from > public.em_india_today()
     or (lic.valid_until is not null and lic.valid_until < public.em_india_today()) then
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


-- One approved device per student. A later phone is a second-device request.
-- Run after 20260926140000_school_roster.sql.

alter table public.em_licences add column if not exists second_device_policy text not null default 'hold';
alter table public.em_licences drop constraint if exists em_licences_second_device_policy_check;
alter table public.em_licences
  add constraint em_licences_second_device_policy_check
  check (second_device_policy in ('hold', 'refuse'));

alter table public.em_roster add column if not exists device_limit int not null default 1;
alter table public.em_roster drop constraint if exists em_roster_device_limit_check;
alter table public.em_roster
  add constraint em_roster_device_limit_check check (device_limit between 1 and 5);

alter table public.em_device_registrations add column if not exists device_id text;
alter table public.em_device_registrations add column if not exists request_kind text not null default 'primary';
alter table public.em_device_registrations drop constraint if exists em_device_registrations_request_kind_check;
alter table public.em_device_registrations
  add constraint em_device_registrations_request_kind_check
  check (request_kind in ('primary', 'extra'));

do $$
declare
  cons text;
begin
  select con.conname into cons
  from pg_constraint as con
  where con.conrelid = 'public.em_device_registrations'::regclass
    and con.contype = 'u'
    and pg_get_constraintdef(con.oid) like '%admission_no%'
    and pg_get_constraintdef(con.oid) not like '%device_id%';
  if cons is not null then
    execute format('alter table public.em_device_registrations drop constraint %I', cons);
  end if;
end $$;
create unique index if not exists em_device_registrations_device_uidx
  on public.em_device_registrations (licence_id, admission_no, device_id)
  where device_id is not null;

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

  update public.em_licences set seats = n where id = p_licence_id;
  return jsonb_build_object('seats', n);
end;
$$;

drop function if exists public.join_school(text, text);

create or replace function public.join_school(p_code text, p_admission text, p_device text)
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
  device text := lower(btrim(coalesce(p_device, '')));
  approved_count int;
  primary_waiting boolean;
  extra_status text;
begin
  if device !~ '^[a-z0-9][a-z0-9._:-]{7,79}$' then
    return jsonb_build_object('ok', false, 'reason', 'no_device');
  end if;

  select * into lic
  from public.em_licences
  where kind = 'school' and school_code is not null and upper(school_code) = upper(btrim(p_code))
  limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'unknown_school');
  end if;
  if lic.status <> 'active'
     or not lic.accepting_devices
     or lic.valid_from > public.em_india_today()
     or (lic.valid_until is not null and lic.valid_until < public.em_india_today()) then
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
  where licence_id = lic.id and admission_no = admission and device_id = device;
  if found then
    if reg.request_kind = 'extra' then
      return jsonb_build_object(
        'ok', true,
        'reason', 'second_device',
        'outcome', reg.status,
        'school', lic.name,
        'name', pupil.student_name,
        'class_label', pupil.standard_label || '-' || pupil.section_label
      );
    end if;
    return jsonb_build_object(
      'ok', true,
      'reason', reg.status,
      'school', lic.name,
      'name', pupil.student_name,
      'class_label', pupil.standard_label || '-' || pupil.section_label
    );
  end if;

  select count(*) into approved_count
  from public.em_device_registrations
  where licence_id = lic.id and admission_no = admission and status = 'approved';

  primary_waiting := exists (
    select 1 from public.em_device_registrations
    where licence_id = lic.id and admission_no = admission and request_kind = 'primary' and status = 'pending'
  );

  if approved_count >= pupil.device_limit or primary_waiting then
    extra_status := case when lic.second_device_policy = 'refuse' then 'rejected' else 'pending' end;
    insert into public.em_device_registrations (licence_id, admission_no, status, device_id, request_kind)
    values (lic.id, admission, extra_status, device, 'extra');
    return jsonb_build_object(
      'ok', true,
      'reason', 'second_device',
      'outcome', extra_status,
      'school', lic.name,
      'name', pupil.student_name,
      'class_label', pupil.standard_label || '-' || pupil.section_label
    );
  end if;

  insert into public.em_device_registrations (licence_id, admission_no, status, device_id, request_kind)
  values (lic.id, admission, 'pending', device, 'primary');

  return jsonb_build_object(
    'ok', true,
    'reason', 'pending',
    'school', lic.name,
    'name', pupil.student_name,
    'class_label', pupil.standard_label || '-' || pupil.section_label
  );
end;
$$;

revoke all on function public.join_school(text, text, text) from public;
grant execute on function public.join_school(text, text, text) to anon, authenticated;


-- School registration stores mother tongue. The student signs in with PIN 123456
-- on the approved device. No student email or private password.
-- Run after 20260926150000_one_device.sql.

alter table public.em_roster add column if not exists mother_tongue text;
alter table public.em_roster add column if not exists login_email text;
alter table public.em_roster add column if not exists user_id uuid references public.profiles (id) on delete set null;

alter table public.em_roster drop constraint if exists em_roster_mother_tongue_check;
alter table public.em_roster
  add constraint em_roster_mother_tongue_check
  check (mother_tongue is null or mother_tongue in ('en', 'ta', 'hi', 'ml', 'te', 'kn', 'fr'));

drop function if exists public.join_school(text, text, text);

create or replace function public.join_school(p_code text, p_admission text, p_device text, p_language text)
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
  device text := lower(btrim(coalesce(p_device, '')));
  language text := lower(btrim(coalesce(p_language, '')));
  approved_count int;
  primary_waiting boolean;
  approved_exists boolean;
  extra_status text;
  login_email text;
  new_user uuid;
begin
  if language not in ('en', 'ta', 'hi', 'ml', 'te', 'kn', 'fr') then
    return jsonb_build_object('ok', false, 'reason', 'language');
  end if;
  if device !~ '^[a-z0-9][a-z0-9._:-]{7,79}$' then
    return jsonb_build_object('ok', false, 'reason', 'no_device');
  end if;

  select * into lic
  from public.em_licences
  where kind = 'school' and school_code is not null and upper(school_code) = upper(btrim(p_code))
  limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'unknown_school');
  end if;
  if lic.status <> 'active'
     or not lic.accepting_devices
     or lic.valid_from > public.em_india_today()
     or (lic.valid_until is not null and lic.valid_until < public.em_india_today()) then
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

  approved_exists := exists (
    select 1 from public.em_device_registrations
    where licence_id = lic.id and admission_no = admission and status = 'approved'
  );
  if not approved_exists then
    update public.em_roster
    set mother_tongue = language
    where id = pupil.id;
    pupil.mother_tongue := language;
    if pupil.user_id is not null then
      update public.profiles
      set mother_tongue = language
      where id = pupil.user_id;
    end if;
  end if;

  if pupil.user_id is null then
    login_email := lower(regexp_replace(lic.school_code, '[^a-zA-Z0-9]', '', 'g'))
      || '.' || lower(regexp_replace(admission, '[^a-zA-Z0-9]', '', 'g'))
      || '@students.englishmastery.app';
    new_user := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      new_user,
      'authenticated',
      'authenticated',
      login_email,
      extensions.crypt('123456', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('display_name', pupil.student_name),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      new_user,
      jsonb_build_object('sub', new_user::text, 'email', login_email, 'email_verified', true),
      'email',
      new_user::text,
      now(),
      now(),
      now()
    );
    update public.profiles
    set display_name = pupil.student_name,
        email = login_email,
        mother_tongue = coalesce(pupil.mother_tongue, language),
        must_change_password = false,
        is_active = true
    where id = new_user;
    update public.em_roster
    set user_id = new_user, login_email = login_email
    where id = pupil.id;
    pupil.user_id := new_user;
    pupil.login_email := login_email;
  end if;

  select * into reg
  from public.em_device_registrations
  where licence_id = lic.id and admission_no = admission and device_id = device;
  if found then
    if reg.request_kind = 'extra' then
      return jsonb_build_object(
        'ok', true, 'reason', 'second_device', 'outcome', reg.status,
        'school', lic.name, 'name', pupil.student_name,
        'class_label', pupil.standard_label || '-' || pupil.section_label
      );
    end if;
    return jsonb_build_object(
      'ok', true, 'reason', reg.status,
      'school', lic.name, 'name', pupil.student_name,
      'class_label', pupil.standard_label || '-' || pupil.section_label
    );
  end if;

  select count(*) into approved_count
  from public.em_device_registrations
  where licence_id = lic.id and admission_no = admission and status = 'approved';
  primary_waiting := exists (
    select 1 from public.em_device_registrations
    where licence_id = lic.id and admission_no = admission and request_kind = 'primary' and status = 'pending'
  );

  if approved_count >= pupil.device_limit or primary_waiting then
    extra_status := case when lic.second_device_policy = 'refuse' then 'rejected' else 'pending' end;
    insert into public.em_device_registrations (licence_id, admission_no, status, device_id, request_kind)
    values (lic.id, admission, extra_status, device, 'extra');
    return jsonb_build_object(
      'ok', true, 'reason', 'second_device', 'outcome', extra_status,
      'school', lic.name, 'name', pupil.student_name,
      'class_label', pupil.standard_label || '-' || pupil.section_label
    );
  end if;

  insert into public.em_device_registrations (licence_id, admission_no, status, device_id, request_kind)
  values (lic.id, admission, 'pending', device, 'primary');
  return jsonb_build_object(
    'ok', true, 'reason', 'pending',
    'school', lic.name, 'name', pupil.student_name,
    'class_label', pupil.standard_label || '-' || pupil.section_label
  );
end;
$$;

create or replace function public.student_pin_login(p_device text, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  device text := lower(btrim(coalesce(p_device, '')));
  reg public.em_device_registrations;
  pupil public.em_roster;
begin
  if p_pin is distinct from '123456' then
    return jsonb_build_object('ok', false, 'reason', 'pin');
  end if;
  if device !~ '^[a-z0-9][a-z0-9._:-]{7,79}$' then
    return jsonb_build_object('ok', false, 'reason', 'no_device');
  end if;

  select * into reg
  from public.em_device_registrations
  where device_id = device
  order by case when status = 'approved' then 0 else 1 end, created_at
  limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'unknown');
  end if;
  if reg.status <> 'approved' then
    return jsonb_build_object(
      'ok', false,
      'reason', case when reg.request_kind = 'extra' then 'second_device' else reg.status end
    );
  end if;

  select * into pupil
  from public.em_roster
  where licence_id = reg.licence_id and admission_no = reg.admission_no;
  if not found or pupil.login_email is null then
    return jsonb_build_object('ok', false, 'reason', 'account');
  end if;
  return jsonb_build_object('ok', true, 'email', pupil.login_email);
end;
$$;

revoke all on function public.join_school(text, text, text, text) from public;
revoke all on function public.student_pin_login(text, text) from public;
grant execute on function public.join_school(text, text, text, text) to anon, authenticated;
grant execute on function public.student_pin_login(text, text) to anon, authenticated;

