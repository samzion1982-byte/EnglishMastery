-- Edit, disable, and delete for one staff member.
-- Run this once after 20260926220000_school_staff_login.sql.

alter table public.em_school_staff add column if not exists active boolean not null default true;

create or replace function public.em_ensure_staff_login(
  p_licence_id uuid,
  p_email text,
  p_name text,
  p_role text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid uuid;
  existing_role text;
  hashed text;
  created boolean := false;
  col_names text := '';
  col_values text := '';
  ident_names text := '';
  ident_values text := '';
  rec record;
  identity jsonb;
  stay_active boolean := true;
begin
  if p_role not in ('teacher', 'school_admin') then
    raise exception 'Unknown staff role';
  end if;

  select id into uid from auth.users where lower(email) = p_email limit 1;

  if uid is not null then
    select role into existing_role from public.profiles where id = uid;
    if existing_role is not null and existing_role not in ('teacher', 'school_admin') then
      raise exception 'That email already belongs to another account: %', p_email;
    end if;
    if exists (
      select 1 from public.em_school_staff
      where user_id = uid and licence_id is distinct from p_licence_id
    ) then
      raise exception 'That email is already used at another school: %', p_email;
    end if;
    select s.active into stay_active
    from public.em_school_staff s
    where s.licence_id = p_licence_id and s.user_id = uid
    limit 1;
    if not found or stay_active is null then
      stay_active := true;
    end if;
    insert into public.profiles (id, role, display_name, email, is_active, must_change_password)
    values (uid, p_role, p_name, p_email, stay_active, true)
    on conflict (id) do update
    set display_name = excluded.display_name,
        email = excluded.email,
        role = excluded.role,
        is_active = stay_active;
    return jsonb_build_object('id', uid, 'created', false, 'active', stay_active);
  end if;

  uid := gen_random_uuid();
  created := true;
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

  insert into public.profiles (id, role, display_name, email, is_active, must_change_password)
  values (uid, p_role, p_name, p_email, true, true)
  on conflict (id) do update
  set display_name = excluded.display_name,
      email = excluded.email,
      role = excluded.role,
      is_active = true,
      must_change_password = true;

  return jsonb_build_object('id', uid, 'created', created, 'active', true);
end;
$$;

revoke all on function public.em_ensure_staff_login(uuid, text, text, text) from public, anon, authenticated;

create or replace function public.apply_school_staff(p_licence_id uuid, p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
  n int;
  person_name text;
  post text;
  mail text;
  lvl int;
  staff_role text;
  seen_name text[] := array[]::text[];
  seen_mail text[] := array[]::text[];
  kept uuid[] := array[]::uuid[];
  login jsonb;
  ord int := 0;
  created_n int := 0;
begin
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
  end if;
  if not exists (select 1 from public.em_licences where id = p_licence_id and kind = 'school') then
    raise exception 'School licence not found';
  end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'Staff list must be a list';
  end if;
  n := jsonb_array_length(p_rows);
  if n < 1 or n > 500 then
    raise exception 'Staff list must contain between 1 and 500 people';
  end if;

  create temporary table pg_temp.em_staff_upload (
    ord int primary key,
    staff_name text not null,
    designation text not null,
    email text not null,
    rank_level int not null,
    user_id uuid,
    active boolean not null
  ) on commit drop;

  for rec in select item from jsonb_array_elements(p_rows) as t(item)
  loop
    ord := ord + 1;
    person_name := regexp_replace(btrim(rec.item->>'staff_name'), '\s+', ' ', 'g');
    post := lower(btrim(rec.item->>'designation'));
    mail := lower(regexp_replace(btrim(coalesce(rec.item->>'email', '')), '\s+', '', 'g'));
    lvl := (rec.item->>'rank_level')::int;
    if char_length(person_name) < 1 or char_length(person_name) > 160 then
      raise exception 'Each staff member needs a name';
    end if;
    if post not in ('principal', 'hod', 'teacher', 'tutor') then
      raise exception 'Unknown designation for %', person_name;
    end if;
    if (post = 'principal' and lvl <> 4)
       or (post = 'hod' and lvl <> 3)
       or (post = 'teacher' and lvl <> 2)
       or (post = 'tutor' and lvl <> 1) then
      raise exception 'Level does not match the designation for %', person_name;
    end if;
    if mail !~ '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' or char_length(mail) > 160 then
      raise exception 'Enter a valid email for %', person_name;
    end if;
    if lower(person_name) = any (seen_name) then
      raise exception 'Duplicate name: %', person_name;
    end if;
    if mail = any (seen_mail) then
      raise exception 'Duplicate email: %', mail;
    end if;
    seen_name := array_append(seen_name, lower(person_name));
    seen_mail := array_append(seen_mail, mail);
    staff_role := case when post = 'principal' then 'school_admin' else 'teacher' end;
    login := public.em_ensure_staff_login(p_licence_id, mail, person_name, staff_role);
    if coalesce((login->>'created')::boolean, false) then
      created_n := created_n + 1;
    end if;
    kept := array_append(kept, (login->>'id')::uuid);
    insert into pg_temp.em_staff_upload (ord, staff_name, designation, email, rank_level, user_id, active)
    values (ord, person_name, post, mail, lvl, (login->>'id')::uuid, coalesce((login->>'active')::boolean, true));
  end loop;

  update public.profiles
  set is_active = false
  where id in (
    select user_id from public.em_school_staff
    where licence_id = p_licence_id
      and user_id is not null
      and user_id <> all (kept)
  );

  delete from public.em_school_staff where licence_id = p_licence_id;

  insert into public.em_school_staff (licence_id, staff_name, designation, email, rank_level, sort_no, user_id, active)
  select p_licence_id, staff_name, designation, email, rank_level, ord, user_id, active
  from pg_temp.em_staff_upload
  order by ord;

  return jsonb_build_object('ok', true, 'count', ord, 'created', created_n);
end;
$$;

revoke all on function public.apply_school_staff(uuid, jsonb) from public;
grant execute on function public.apply_school_staff(uuid, jsonb) to authenticated;

create or replace function public.reset_school_staff_password(p_licence_id uuid, p_staff_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid uuid;
  hashed text;
begin
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
  end if;
  select user_id into uid
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
  update public.profiles set must_change_password = true, is_active = true where id = uid;
end;
$$;

revoke all on function public.reset_school_staff_password(uuid, uuid) from public;
grant execute on function public.reset_school_staff_password(uuid, uuid) to authenticated;

create or replace function public.my_school_staff()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'name', s.staff_name,
    'designation', s.designation,
    'level', s.rank_level,
    'email', s.email,
    'school', l.name
  ) into result
  from public.em_school_staff s
  join public.em_licences l on l.id = s.licence_id
  where s.user_id = auth.uid()
  limit 1;
  return result;
end;
$$;

revoke all on function public.my_school_staff() from public;
grant execute on function public.my_school_staff() to authenticated;

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
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
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

create or replace function public.set_school_staff_active(p_licence_id uuid, p_staff_id uuid, p_active boolean)
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
  update public.em_school_staff
  set active = p_active
  where id = p_staff_id and licence_id = p_licence_id
  returning user_id into uid;
  if not found then
    raise exception 'That staff member is not on this school';
  end if;
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
  if not public.is_super_admin() then
    raise exception 'Super Admin required';
  end if;
  select user_id into uid
  from public.em_school_staff
  where id = p_staff_id and licence_id = p_licence_id;
  if not found then
    raise exception 'That staff member is not on this school';
  end if;
  if uid is not null then
    update public.profiles set is_active = false where id = uid;
  end if;
  delete from public.em_school_staff where id = p_staff_id and licence_id = p_licence_id;
end;
$$;

revoke all on function public.delete_school_staff(uuid, uuid) from public;
grant execute on function public.delete_school_staff(uuid, uuid) to authenticated;

