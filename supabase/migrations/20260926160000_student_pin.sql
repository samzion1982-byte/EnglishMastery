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
