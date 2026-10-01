-- Staff list for a school. One worksheet: S. No, Name, Designation, Level.
-- Sign-in emails are added by 20260926220000_school_staff_login.sql.
-- If this file has already been run, run that file next. Running this file again
-- after the login file would remove email sign-in, so do not run it a second time.

create table if not exists public.em_school_staff (
  id uuid primary key default gen_random_uuid(),
  licence_id uuid not null references public.em_licences (id) on delete cascade,
  staff_name text not null,
  designation text not null,
  rank_level int not null,
  sort_no int not null,
  created_at timestamptz not null default now(),
  constraint em_school_staff_name_check check (char_length(btrim(staff_name)) between 1 and 160),
  constraint em_school_staff_designation_check check (designation in ('principal', 'hod', 'teacher', 'tutor')),
  constraint em_school_staff_level_check check (
    (designation = 'principal' and rank_level = 4)
    or (designation = 'hod' and rank_level = 3)
    or (designation = 'teacher' and rank_level = 2)
    or (designation = 'tutor' and rank_level = 1)
  ),
  unique (licence_id, sort_no)
);

create unique index if not exists em_school_staff_name_uidx
  on public.em_school_staff (licence_id, lower(staff_name));

alter table public.em_school_staff enable row level security;

drop policy if exists em_school_staff_super_admin on public.em_school_staff;
create policy em_school_staff_super_admin on public.em_school_staff
  for select to authenticated
  using (public.is_super_admin());

grant select on public.em_school_staff to authenticated;

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
  lvl int;
  seen text[] := array[]::text[];
  ord int := 0;
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

  for rec in select item from jsonb_array_elements(p_rows) as t(item)
  loop
    person_name := regexp_replace(btrim(rec.item->>'staff_name'), '\s+', ' ', 'g');
    post := lower(btrim(rec.item->>'designation'));
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
    if lower(person_name) = any (seen) then
      raise exception 'Duplicate name: %', person_name;
    end if;
    seen := array_append(seen, lower(person_name));
  end loop;

  delete from public.em_school_staff where licence_id = p_licence_id;

  for rec in select item from jsonb_array_elements(p_rows) as t(item)
  loop
    ord := ord + 1;
    insert into public.em_school_staff (licence_id, staff_name, designation, rank_level, sort_no)
    values (
      p_licence_id,
      regexp_replace(btrim(rec.item->>'staff_name'), '\s+', ' ', 'g'),
      lower(btrim(rec.item->>'designation')),
      (rec.item->>'rank_level')::int,
      ord
    );
  end loop;

  return jsonb_build_object('ok', true, 'count', ord);
end;
$$;

revoke all on function public.apply_school_staff(uuid, jsonb) from public;
grant execute on function public.apply_school_staff(uuid, jsonb) to authenticated;
