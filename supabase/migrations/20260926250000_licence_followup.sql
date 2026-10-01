-- Follow-up licence repairs. Run once after 20260926240000_licence_repairs.sql.
-- Tracker replace and the academic year commit together.
-- A colliding sign-in email gets a stable suffix instead of blocking the student.
-- Individual licences are tied to learner accounts. Licence changes are recorded.

create table if not exists public.em_licence_events (
  id uuid primary key default gen_random_uuid(),
  licence_id uuid,
  actor_id uuid,
  action text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists em_licence_events_licence_idx
  on public.em_licence_events (licence_id, created_at desc);

alter table public.em_licence_events enable row level security;
drop policy if exists em_licence_events_super_admin on public.em_licence_events;
create policy em_licence_events_super_admin on public.em_licence_events
  for select to authenticated
  using (public.is_super_admin());
grant select on public.em_licence_events to authenticated;

create or replace function public.em_log_licence_event(p_licence_id uuid, p_action text, p_detail text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.em_licence_events (licence_id, actor_id, action, detail)
  values (p_licence_id, auth.uid(), left(coalesce(p_action, 'updated'), 40), left(coalesce(p_detail, ''), 500));
end;
$$;

revoke all on function public.em_log_licence_event(uuid, text, text) from public, anon, authenticated;

create or replace function public.em_licences_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  detail text := '';
begin
  if tg_op = 'INSERT' then
    perform public.em_log_licence_event(new.id, 'created', new.kind || ' ' || new.name);
    return new;
  end if;
  if tg_op = 'DELETE' then
    perform public.em_log_licence_event(old.id, 'deleted', old.kind || ' ' || old.name);
    return old;
  end if;
  if new.status is distinct from old.status then
    detail := detail || ' standing ' || new.status;
  end if;
  if new.valid_from is distinct from old.valid_from or new.valid_until is distinct from old.valid_until then
    detail := detail || ' dates ' || new.valid_from::text || ' to ' || coalesce(new.valid_until::text, 'open');
  end if;
  if new.seats is distinct from old.seats then
    detail := detail || ' seats ' || new.seats::text;
  end if;
  if new.academic_year is distinct from old.academic_year then
    detail := detail || ' year ' || coalesce(new.academic_year, 'none');
  end if;
  if new.accepting_devices is distinct from old.accepting_devices then
    detail := detail || case when new.accepting_devices then ' registrations open' else ' registrations closed' end;
  end if;
  if new.name is distinct from old.name then
    detail := detail || ' name ' || new.name;
  end if;
  if btrim(detail) <> '' then
    perform public.em_log_licence_event(new.id, 'updated', btrim(detail));
  end if;
  return new;
end;
$$;

drop trigger if exists em_licences_audit on public.em_licences;
create trigger em_licences_audit
  after insert or update or delete on public.em_licences
  for each row execute procedure public.em_licences_audit();

create or replace function public.em_device_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.em_log_licence_event(new.licence_id, 'device', new.admission_no || ' ' || new.request_kind || ' ' || new.status);
  elsif new.status is distinct from old.status then
    perform public.em_log_licence_event(new.licence_id, 'device', new.admission_no || ' ' || new.request_kind || ' ' || new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists em_device_audit on public.em_device_registrations;
create trigger em_device_audit
  after insert or update of status on public.em_device_registrations
  for each row execute procedure public.em_device_audit();

drop function if exists public.apply_school_roster(uuid, jsonb);

create function public.apply_school_roster(p_licence_id uuid, p_rows jsonb, p_academic_year text)
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
  year text := btrim(coalesce(p_academic_year, ''));
begin
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
  end if;
  if year !~ '^20[0-9]{2}-[0-9]{2}$' then
    raise exception 'Enter the academic year as 2026-27';
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

  create temp table if not exists _em_roster_kept (
    admission_no text primary key,
    device_limit int,
    active boolean,
    user_id uuid,
    login_email text,
    mother_tongue text
  ) on commit drop;
  truncate _em_roster_kept;
  insert into _em_roster_kept (admission_no, device_limit, active, user_id, login_email, mother_tongue)
  select admission_no, device_limit, active, user_id, login_email, mother_tongue
  from public.em_roster
  where licence_id = p_licence_id;

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
  set device_limit = kept.device_limit,
      active = kept.active,
      user_id = kept.user_id,
      login_email = kept.login_email,
      mother_tongue = kept.mother_tongue
  from _em_roster_kept as kept
  where roster.licence_id = p_licence_id and roster.admission_no = kept.admission_no;

  update public.em_licences
  set seats = n, academic_year = year
  where id = p_licence_id;
  perform public.em_log_licence_event(p_licence_id, 'roster', 'Class list replaced for ' || year || '. ' || n::text || ' students.');
  return jsonb_build_object('seats', n, 'academic_year', year);
end;
$$;

revoke all on function public.apply_school_roster(uuid, jsonb, text) from public;
grant execute on function public.apply_school_roster(uuid, jsonb, text) to authenticated;

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
  perform public.em_log_licence_event(p_licence_id, 'student', 'Removed ' || admission);
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

revoke all on function public.delete_school_student(uuid, text) from public;
grant execute on function public.delete_school_student(uuid, text) to authenticated;

create or replace function public.em_student_login_email(p_school_code text, p_admission text, p_pupil_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  base text := lower(regexp_replace(coalesce(p_school_code, ''), '[^a-zA-Z0-9]', '', 'g'))
    || '.' || lower(regexp_replace(coalesce(p_admission, ''), '[^a-zA-Z0-9]', '', 'g'));
  raw text := lower(coalesce(p_school_code, '')) || '|' || upper(btrim(coalesce(p_admission, '')));
  stamp text := substr(md5(raw), 1, 10);
  candidate text;
  candidates text[] := array[
    base || '@students.englishmastery.app',
    base || '.' || stamp || '@students.englishmastery.app',
    base || '.' || md5(raw) || '@students.englishmastery.app'
  ];
begin
  foreach candidate in array candidates
  loop
    if not exists (select 1 from auth.users where lower(email) = candidate)
       and not exists (
         select 1 from public.em_roster
         where id is distinct from p_pupil_id and lower(coalesce(login_email, '')) = candidate
       ) then
      return candidate;
    end if;
  end loop;
  return null;
end;
$$;

revoke all on function public.em_student_login_email(text, text, uuid) from public, anon, authenticated;

create table if not exists public.em_individual_members (
  licence_id uuid not null references public.em_licences (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (licence_id, user_id),
  unique (user_id)
);

alter table public.em_individual_members enable row level security;
drop policy if exists em_individual_members_super_admin on public.em_individual_members;
create policy em_individual_members_super_admin on public.em_individual_members
  for select to authenticated
  using (public.is_super_admin());
grant select on public.em_individual_members to authenticated;

create or replace function public.assign_individual_learner(p_licence_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  lic public.em_licences;
  holder uuid;
  mail text := lower(btrim(coalesce(p_email, '')));
  used int;
begin
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
  end if;
  select * into lic from public.em_licences where id = p_licence_id and kind = 'individual';
  if not found then
    raise exception 'Individual licence not found';
  end if;
  select id into holder from public.profiles where lower(email) = mail and role = 'student' limit 1;
  if holder is null then
    raise exception 'No individual student uses that email';
  end if;
  if exists (select 1 from public.em_roster where user_id = holder) then
    raise exception 'That student belongs to a school';
  end if;
  if exists (select 1 from public.em_individual_members where user_id = holder and licence_id <> p_licence_id) then
    raise exception 'That student is already on another individual licence';
  end if;
  if exists (select 1 from public.em_individual_members where user_id = holder and licence_id = p_licence_id) then
    return;
  end if;
  select count(*) into used from public.em_individual_members where licence_id = p_licence_id;
  if used >= lic.seats then
    raise exception 'This licence has no free seats';
  end if;
  insert into public.em_individual_members (licence_id, user_id) values (p_licence_id, holder);
  perform public.em_log_licence_event(p_licence_id, 'learner', 'Assigned ' || mail);
end;
$$;

revoke all on function public.assign_individual_learner(uuid, text) from public;
grant execute on function public.assign_individual_learner(uuid, text) to authenticated;

create or replace function public.remove_individual_learner(p_licence_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  mail text;
begin
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
  end if;
  select email into mail from public.profiles where id = p_user_id;
  delete from public.em_individual_members where licence_id = p_licence_id and user_id = p_user_id;
  if not found then
    raise exception 'That learner is not on this licence';
  end if;
  perform public.em_log_licence_event(p_licence_id, 'learner', 'Removed ' || coalesce(mail, 'learner'));
end;
$$;

revoke all on function public.remove_individual_learner(uuid, uuid) from public;
grant execute on function public.remove_individual_learner(uuid, uuid) to authenticated;

create or replace function public.individual_sign_in_gate()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  lic public.em_licences;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'none');
  end if;
  if exists (select 1 from public.em_roster where user_id = uid) then
    return jsonb_build_object('ok', true, 'kind', 'school');
  end if;
  if to_regclass('public.em_school_staff') is not null
     and exists (select 1 from public.em_school_staff where user_id = uid) then
    return jsonb_build_object('ok', true, 'kind', 'staff');
  end if;
  select l.* into lic
  from public.em_individual_members m
  join public.em_licences l on l.id = m.licence_id
  where m.user_id = uid and l.kind = 'individual';
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'none');
  end if;
  if lic.status <> 'active'
     or lic.valid_from > public.em_india_today()
     or (lic.valid_until is not null and lic.valid_until < public.em_india_today()) then
    return jsonb_build_object('ok', false, 'reason', 'closed', 'name', lic.name);
  end if;
  return jsonb_build_object('ok', true, 'kind', 'individual', 'name', lic.name);
end;
$$;

revoke all on function public.individual_sign_in_gate() from public;
grant execute on function public.individual_sign_in_gate() to authenticated;

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
  student_email text;
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
  if not coalesce(pupil.active, true) then
    return jsonb_build_object('ok', false, 'reason', 'inactive', 'school', lic.name);
  end if;

  begin
    if pupil.user_id is null then
      student_email := public.em_student_login_email(lic.school_code, admission, pupil.id);
      if student_email is null then
        return jsonb_build_object('ok', false, 'reason', 'email_collision', 'school', lic.name);
      end if;
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
      new_user := public.em_provision_student_login(student_email, pupil.student_name, language);
      update public.em_roster
      set user_id = new_user, login_email = student_email
      where id = pupil.id;
      pupil.user_id := new_user;
      pupil.login_email := student_email;
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
      if extra_status = 'pending' and approved_count >= 5 then
        extra_status := 'rejected';
      end if;
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
  exception
    when others then
      return jsonb_build_object('ok', false, 'reason', 'account', 'detail', sqlerrm);
  end;
end;
$$;


revoke all on function public.join_school(text, text, text, text) from public;
grant execute on function public.join_school(text, text, text, text) to anon, authenticated;
