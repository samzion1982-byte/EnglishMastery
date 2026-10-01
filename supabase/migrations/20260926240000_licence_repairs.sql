-- Licence repairs. Run this once after 20260926230000_school_staff_controls.sql.
-- Approved students keep signing in when new registrations are closed.
-- A suspended or ended licence blocks sign-in.
-- Replacing a tracker keeps each remaining student's account, login email, and mother tongue.

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
  lic public.em_licences;
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
  if not coalesce(pupil.active, true) then
    return jsonb_build_object('ok', false, 'reason', 'inactive');
  end if;

  select * into lic from public.em_licences where id = pupil.licence_id;
  if not found
     or lic.status <> 'active'
     or lic.valid_from > public.em_india_today()
     or (lic.valid_until is not null and lic.valid_until < public.em_india_today()) then
    return jsonb_build_object('ok', false, 'reason', 'closed', 'school', lic.name);
  end if;

  return jsonb_build_object('ok', true, 'email', pupil.login_email);
end;
$$;

revoke all on function public.student_pin_login(text, text) from public;
grant execute on function public.student_pin_login(text, text) to anon, authenticated;

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

  update public.em_licences set seats = n where id = p_licence_id;
  return jsonb_build_object('seats', n);
end;
$$;

revoke all on function public.apply_school_roster(uuid, jsonb) from public;
grant execute on function public.apply_school_roster(uuid, jsonb) to authenticated;

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
  if to_regclass('public.em_school_staff') is not null then
    for uid in
      select s.user_id from public.em_school_staff s
      where s.licence_id = p_licence_id and s.user_id is not null
    loop
      delete from auth.users where id = uid;
    end loop;
  end if;
  delete from public.em_licences where id = p_licence_id;
end;
$$;

revoke all on function public.delete_school(uuid) from public;
grant execute on function public.delete_school(uuid) to authenticated;

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
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
  end if;
  select user_id, active into uid, stay_active
  from public.em_school_staff
  where id = p_staff_id and licence_id = p_licence_id;
  if uid is null then
    raise exception 'That staff sign-in is not ready. Upload the staff file again.';
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

create or replace function public.decide_school_device(p_licence_id uuid, p_registration_id uuid, p_allow boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  reg public.em_device_registrations;
  approved_count int;
  next_limit int;
begin
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
  end if;
  select * into reg
  from public.em_device_registrations
  where id = p_registration_id and licence_id = p_licence_id
  for update;
  if not found then
    raise exception 'That registration was not found';
  end if;
  if not p_allow then
    update public.em_device_registrations set status = 'rejected' where id = reg.id;
    return;
  end if;
  if reg.status = 'approved' then
    return;
  end if;
  perform 1
  from public.em_roster
  where licence_id = p_licence_id and admission_no = reg.admission_no
  for update;
  select count(*) into approved_count
  from public.em_device_registrations
  where licence_id = p_licence_id
    and admission_no = reg.admission_no
    and status = 'approved';
  if approved_count >= 5 then
    raise exception 'This student already has five devices';
  end if;
  next_limit := least(5, approved_count + 1);
  update public.em_roster
  set device_limit = greatest(device_limit, next_limit)
  where licence_id = p_licence_id and admission_no = reg.admission_no;
  update public.em_device_registrations set status = 'approved' where id = reg.id;
end;
$$;

revoke all on function public.decide_school_device(uuid, uuid, boolean) from public;
grant execute on function public.decide_school_device(uuid, uuid, boolean) to authenticated;

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
      student_email := lower(regexp_replace(lic.school_code, '[^a-zA-Z0-9]', '', 'g'))
        || '.' || lower(regexp_replace(admission, '[^a-zA-Z0-9]', '', 'g'))
        || '@students.englishmastery.app';
      if exists (select 1 from auth.users where lower(email) = student_email)
         or exists (
           select 1 from public.em_roster
           where id <> pupil.id and lower(coalesce(login_email, '')) = student_email
         ) then
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
