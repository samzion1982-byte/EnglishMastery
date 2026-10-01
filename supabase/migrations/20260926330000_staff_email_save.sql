-- Save staff email addresses even when a sign-in cannot be created.
-- Run this once in the Supabase SQL editor, then click Save staff list again.

alter table public.em_school_staff add column if not exists email text;
alter table public.em_school_staff add column if not exists user_id uuid;
alter table public.em_school_staff add column if not exists active boolean not null default true;

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
  login jsonb;
  ord int := 0;
  created_n int := 0;
  login_note text := '';
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
    rank_level int not null
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
    insert into pg_temp.em_staff_upload (ord, staff_name, designation, email, rank_level)
    values (ord, person_name, post, mail, lvl);
  end loop;

  update public.profiles
  set is_active = false
  where id in (
    select user_id from public.em_school_staff
    where licence_id = p_licence_id
      and user_id is not null
      and lower(staff_name) not in (select lower(staff_name) from pg_temp.em_staff_upload)
  );

  delete from public.em_school_staff
  where licence_id = p_licence_id
    and lower(staff_name) not in (select lower(staff_name) from pg_temp.em_staff_upload);

  update public.em_school_staff as staff
  set sort_no = -upload.ord,
      designation = upload.designation,
      email = upload.email,
      rank_level = upload.rank_level
  from pg_temp.em_staff_upload as upload
  where staff.licence_id = p_licence_id
    and lower(staff.staff_name) = lower(upload.staff_name);

  update public.em_school_staff
  set sort_no = -sort_no
  where licence_id = p_licence_id
    and sort_no < 0;

  insert into public.em_school_staff (licence_id, staff_name, designation, email, rank_level, sort_no, active)
  select p_licence_id, upload.staff_name, upload.designation, upload.email, upload.rank_level, upload.ord, true
  from pg_temp.em_staff_upload as upload
  where not exists (
    select 1 from public.em_school_staff as staff
    where staff.licence_id = p_licence_id
      and lower(staff.staff_name) = lower(upload.staff_name)
  );

  for rec in
    select id, staff_name, designation, email, user_id
    from public.em_school_staff
    where licence_id = p_licence_id
    order by sort_no
  loop
    staff_role := case when rec.designation = 'principal' then 'school_admin' else 'teacher' end;
    begin
      if rec.user_id is null then
        login := public.em_ensure_staff_login(p_licence_id, rec.email, rec.staff_name, staff_role);
        update public.em_school_staff
        set user_id = (login->>'id')::uuid
        where id = rec.id;
        if coalesce((login->>'created')::boolean, false) then
          created_n := created_n + 1;
        end if;
      else
        update auth.users
        set email = rec.email, updated_at = now()
        where id = rec.user_id and lower(email) is distinct from rec.email;
        update auth.identities
        set provider_id = rec.email,
            identity_data = jsonb_set(coalesce(identity_data, '{}'::jsonb), '{email}', to_jsonb(rec.email), true)
        where user_id = rec.user_id and provider = 'email' and provider_id is distinct from rec.email;
        update public.profiles
        set display_name = rec.staff_name, email = rec.email, role = staff_role, is_active = true
        where id = rec.user_id;
      end if;
    exception
      when others then
        if login_note = '' then
          login_note := SQLERRM;
        end if;
    end;
  end loop;

  return jsonb_build_object('ok', true, 'count', ord, 'created', created_n, 'warning', login_note);
end;
$$;

revoke all on function public.apply_school_staff(uuid, jsonb) from public;
grant execute on function public.apply_school_staff(uuid, jsonb) to authenticated;
