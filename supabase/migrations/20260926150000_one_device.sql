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
