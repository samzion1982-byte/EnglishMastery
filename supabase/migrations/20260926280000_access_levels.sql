-- Admin shares Super Admin data access.
-- Principal and HOD can edit learning content.
-- A principal can edit staff on their own school.
-- Deleting a school requires the master password.
-- Run this once after 20260926270000_add_school_staff.sql.

alter table public.em_school_staff add column if not exists active boolean not null default true;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('super_admin', 'admin1')
      and is_active is distinct from false
  );
$$;

create or replace function public.is_content_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin_staff()
    or exists (
      select 1 from public.em_school_staff
      where user_id = auth.uid()
        and designation in ('principal', 'hod')
        and coalesce(active, true)
    );
$$;

revoke all on function public.is_content_editor() from public;
grant execute on function public.is_content_editor() to authenticated;

drop policy if exists core_words_student_read on public.core_words;
create policy core_words_student_read on public.core_words
  for select to authenticated
  using (status = 'published' or public.is_content_editor());

drop policy if exists core_words_admin_write on public.core_words;
create policy core_words_admin_write on public.core_words
  for all to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists appendix_categories_read on public.appendix_categories;
create policy appendix_categories_read on public.appendix_categories
  for select to authenticated
  using (public.is_content_editor() or is_enabled);

drop policy if exists appendix_categories_write on public.appendix_categories;
create policy appendix_categories_write on public.appendix_categories
  for all to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists appendix_items_read on public.appendix_items;
create policy appendix_items_read on public.appendix_items
  for select to authenticated
  using (
    public.is_content_editor()
    or (
      status = 'published'
      and public.appendix_category_visible(category_id)
    )
  );

drop policy if exists appendix_items_write on public.appendix_items;
create policy appendix_items_write on public.appendix_items
  for all to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

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
    'school', l.name,
    'licence_id', l.id,
    'school_code', l.school_code
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

create or replace function public.list_my_school_staff()
returns table (
  id uuid,
  staff_name text,
  designation text,
  email text,
  rank_level int,
  sort_no int,
  active boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.staff_name, s.designation, s.email, s.rank_level, s.sort_no, coalesce(s.active, true)
  from public.em_school_staff s
  where s.licence_id = (
    select me.licence_id
    from public.em_school_staff me
    where me.user_id = auth.uid()
      and me.designation = 'principal'
      and coalesce(me.active, true)
    limit 1
  )
  order by s.sort_no;
$$;

revoke all on function public.list_my_school_staff() from public;
grant execute on function public.list_my_school_staff() to authenticated;

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
  if not public.is_super_admin() and not exists (
    select 1 from public.em_school_staff me
    where me.user_id = auth.uid()
      and me.licence_id = p_licence_id
      and me.designation = 'principal'
      and coalesce(me.active, true)
  ) then
    raise exception 'Principal access required';
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
  if uid = auth.uid() and post <> 'principal' and not public.is_super_admin() then
    raise exception 'Keep your own designation as principal';
  end if;
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

drop function if exists public.delete_school(uuid);

create or replace function public.delete_school(p_licence_id uuid, p_password text)
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
  if coalesce(p_password, '') <> 'Master007))&' then
    raise exception 'Master password is not correct';
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

revoke all on function public.delete_school(uuid, text) from public;
grant execute on function public.delete_school(uuid, text) to authenticated;
