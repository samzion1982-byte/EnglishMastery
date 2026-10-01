-- Create the hidden student sign-in when a computer registers.
-- Run this once in the Supabase SQL editor.

create or replace function public.em_india_today()
returns date
language sql
stable
as $$
  select (timezone('Asia/Kolkata', now()))::date;
$$;

alter table public.em_roster add column if not exists active boolean not null default true;

create or replace function public.em_provision_student_login(p_email text, p_name text, p_language text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid uuid := gen_random_uuid();
  hashed text;
  col_names text := '';
  col_values text := '';
  ident_names text := '';
  ident_values text := '';
  rec record;
  identity jsonb;
begin
  begin
    hashed := extensions.crypt('123456', extensions.gen_salt('bf'));
  exception
    when undefined_function then
      hashed := crypt('123456', gen_salt('bf'));
  end;

  identity := jsonb_build_object('sub', uid::text, 'email', p_email, 'email_verified', true);

  for rec in
    select * from (values
      ('instance_id', quote_literal('00000000-0000-0000-0000-000000000000') || '::uuid'),
      ('id', quote_literal(uid::text) || '::uuid'),
      ('aud', quote_literal('authenticated')),
      ('role', quote_literal('authenticated')),
      ('email', quote_literal(p_email)),
      ('encrypted_password', quote_literal(hashed)),
      ('email_confirmed_at', 'now()'),
      ('raw_app_meta_data', quote_literal('{"provider":"email","providers":["email"]}') || '::jsonb'),
      ('raw_user_meta_data', quote_literal(jsonb_build_object('display_name', p_name)::text) || '::jsonb'),
      ('created_at', 'now()'),
      ('updated_at', 'now()'),
      ('confirmation_token', quote_literal('')),
      ('email_change', quote_literal('')),
      ('email_change_token_new', quote_literal('')),
      ('email_change_token_current', quote_literal('')),
      ('recovery_token', quote_literal('')),
      ('reauthentication_token', quote_literal('')),
      ('phone_change', quote_literal('')),
      ('phone_change_token', quote_literal('')),
      ('is_sso_user', 'false'),
      ('is_anonymous', 'false')
    ) as t(name, expr)
  loop
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'auth'
        and table_name = 'users'
        and column_name = rec.name
        and is_generated = 'NEVER'
    ) then
      col_names := col_names || case when col_names = '' then '' else ', ' end || quote_ident(rec.name);
      col_values := col_values || case when col_values = '' then '' else ', ' end || rec.expr;
    end if;
  end loop;

  execute 'insert into auth.users (' || col_names || ') values (' || col_values || ')';

  for rec in
    select * from (values
      ('id', quote_literal(gen_random_uuid()::text) || '::uuid'),
      ('user_id', quote_literal(uid::text) || '::uuid'),
      ('provider_id', quote_literal(p_email)),
      ('identity_data', quote_literal(identity::text) || '::jsonb'),
      ('provider', quote_literal('email')),
      ('created_at', 'now()'),
      ('updated_at', 'now()')
    ) as t(name, expr)
  loop
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'auth'
        and table_name = 'identities'
        and column_name = rec.name
        and coalesce(is_generated, 'NEVER') = 'NEVER'
    ) then
      ident_names := ident_names || case when ident_names = '' then '' else ', ' end || quote_ident(rec.name);
      ident_values := ident_values || case when ident_values = '' then '' else ', ' end || rec.expr;
    end if;
  end loop;

  if ident_names <> '' then
    execute 'insert into auth.identities (' || ident_names || ') values (' || ident_values || ')';
  end if;

  insert into public.profiles (id, role, display_name, email, mother_tongue, is_active, must_change_password)
  values (uid, 'student', p_name, p_email, p_language, true, false)
  on conflict (id) do update
  set display_name = excluded.display_name,
      email = excluded.email,
      mother_tongue = excluded.mother_tongue,
      must_change_password = false,
      is_active = true;

  return uid;
end;
$$;

revoke all on function public.em_provision_student_login(text, text, text) from public;

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
      student_email := lower(regexp_replace(lic.school_code, '[^a-zA-Z0-9]', '', 'g'))
        || '.' || lower(regexp_replace(admission, '[^a-zA-Z0-9]', '', 'g'))
        || '@students.englishmastery.app';
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
