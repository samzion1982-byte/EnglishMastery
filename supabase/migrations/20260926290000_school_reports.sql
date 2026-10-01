-- Which standards an HOD covers, and which classes a teacher or tutor covers.
-- Learning reports are built from that coverage.
-- Run after 20260926280000_access_levels.sql.

create table if not exists public.em_staff_scope (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.em_school_staff (id) on delete cascade,
  licence_id uuid not null references public.em_licences (id) on delete cascade,
  standard_label text not null,
  section_label text,
  constraint em_staff_scope_standard_check check (standard_label ~ '^(XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)$'),
  constraint em_staff_scope_section_check check (section_label is null or section_label ~ '^[A-Z]$')
);

create unique index if not exists em_staff_scope_uidx
  on public.em_staff_scope (staff_id, standard_label, coalesce(section_label, ''));

create index if not exists em_staff_scope_licence_idx
  on public.em_staff_scope (licence_id, standard_label, section_label);

alter table public.em_staff_scope enable row level security;

create or replace function public.em_standard_rank(p_label text)
returns int
language sql
immutable
as $$
  select case upper(btrim(coalesce(p_label, '')))
    when 'I' then 1 when 'II' then 2 when 'III' then 3 when 'IV' then 4
    when 'V' then 5 when 'VI' then 6 when 'VII' then 7 when 'VIII' then 8
    when 'IX' then 9 when 'X' then 10 when 'XI' then 11 when 'XII' then 12
    else 99
  end;
$$;

create or replace function public.em_report_actor(p_licence_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  staff_id uuid;
  post text;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  if not exists (select 1 from public.em_licences where id = p_licence_id and kind = 'school') then
    raise exception 'School not found';
  end if;
  if public.is_super_admin() then
    return jsonb_build_object('kind', 'super', 'can_assign', true);
  end if;
  select s.id, s.designation into staff_id, post
  from public.em_school_staff s
  where s.user_id = auth.uid()
    and s.licence_id = p_licence_id
    and s.active is distinct from false;
  if staff_id is null then
    raise exception 'School access required';
  end if;
  return jsonb_build_object(
    'kind', post,
    'staff_id', staff_id,
    'can_assign', post = 'principal'
  );
end;
$$;

create or replace function public.list_school_coverage(p_licence_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor jsonb;
  school_name text;
  school_code text;
  standards jsonb;
  classes jsonb;
  people jsonb;
begin
  actor := public.em_report_actor(p_licence_id);
  select l.name, l.school_code into school_name, school_code
  from public.em_licences l
  where l.id = p_licence_id;

  select coalesce(jsonb_agg(std order by public.em_standard_rank(std)), '[]'::jsonb)
  into standards
  from (
    select distinct r.standard_label as std
    from public.em_roster r
    where r.licence_id = p_licence_id and r.active is distinct from false
  ) ranks;

  select coalesce(jsonb_agg(jsonb_build_object('standard', standard_label, 'section', section_label) order by public.em_standard_rank(standard_label), section_label), '[]'::jsonb)
  into classes
  from (
    select distinct r.standard_label, r.section_label
    from public.em_roster r
    where r.licence_id = p_licence_id and r.active is distinct from false
  ) rooms;

  select coalesce(jsonb_agg(person order by person->>'sort'), '[]'::jsonb)
  into people
  from (
    select jsonb_build_object(
      'id', s.id,
      'name', s.staff_name,
      'designation', s.designation,
      'sort', lpad(s.sort_no::text, 4, '0'),
      'coverage', coalesce((
        select jsonb_agg(jsonb_build_object('standard', c.standard_label, 'section', c.section_label) order by public.em_standard_rank(c.standard_label), c.section_label)
        from public.em_staff_scope c
        where c.staff_id = s.id
      ), '[]'::jsonb)
    ) as person
    from public.em_school_staff s
    where s.licence_id = p_licence_id
      and s.active is distinct from false
      and s.designation in ('hod', 'teacher', 'tutor')
      and (
        coalesce(actor->>'can_assign', 'false') = 'true'
        or s.id = nullif(actor->>'staff_id', '')::uuid
      )
  ) listed;

  return jsonb_build_object(
    'school', school_name,
    'code', school_code,
    'can_assign', coalesce(actor->>'can_assign', 'false') = 'true',
    'mode', case when actor->>'kind' in ('teacher', 'tutor') then 'class' else 'standard' end,
    'standards', standards,
    'classes', classes,
    'staff', people
  );
end;
$$;

create or replace function public.set_staff_coverage(p_staff_id uuid, p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  lic uuid;
  post text;
  actor jsonb;
  rec record;
  std text;
  sec text;
begin
  if jsonb_typeof(coalesce(p_items, 'null'::jsonb)) is distinct from 'array' then
    raise exception 'Choose the standards or classes to assign';
  end if;
  select s.licence_id, s.designation into lic, post
  from public.em_school_staff s
  where s.id = p_staff_id and s.active is distinct from false;
  if lic is null then
    raise exception 'Staff member not found';
  end if;
  if post not in ('hod', 'teacher', 'tutor') then
    raise exception 'Assign standards to an HOD, or classes to a teacher or tutor';
  end if;
  actor := public.em_report_actor(lic);
  if coalesce(actor->>'can_assign', 'false') <> 'true' then
    raise exception 'Only the principal can assign classes';
  end if;

  create temporary table if not exists _em_cov (
    standard_label text not null,
    section_label text
  ) on commit drop;
  truncate _em_cov;

  for rec in
    select distinct
      upper(btrim(item->>'standard')) as standard_label,
      nullif(upper(btrim(coalesce(item->>'section', ''))), '') as section_label
    from jsonb_array_elements(p_items) item
  loop
    std := rec.standard_label;
    sec := rec.section_label;
    if post = 'hod' then
      sec := null;
    elsif sec is null then
      raise exception 'Choose a class, such as VI-A, for each teacher or tutor';
    end if;
    if std is null or std !~ '^(XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)$' then
      raise exception 'That standard is not on this school roll';
    end if;
    if not exists (
      select 1 from public.em_roster r
      where r.licence_id = lic
        and r.active is distinct from false
        and r.standard_label = std
        and (sec is null or r.section_label = sec)
    ) then
      raise exception 'That class is not on this school roll';
    end if;
    insert into _em_cov (standard_label, section_label) values (std, sec);
  end loop;

  if post = 'hod' then
    delete from public.em_staff_scope scope
    using public.em_school_staff other
    where scope.staff_id = other.id
      and other.licence_id = lic
      and other.designation = 'hod'
      and other.id <> p_staff_id
      and scope.section_label is null
      and exists (
        select 1 from _em_cov cov
        where cov.standard_label = scope.standard_label
      );
  else
    delete from public.em_staff_scope scope
    using public.em_school_staff other
    where scope.staff_id = other.id
      and other.licence_id = lic
      and other.designation in ('teacher', 'tutor')
      and other.id <> p_staff_id
      and exists (
        select 1 from _em_cov cov
        where cov.standard_label = scope.standard_label
          and cov.section_label = scope.section_label
      );
  end if;

  delete from public.em_staff_scope where staff_id = p_staff_id;
  insert into public.em_staff_scope (staff_id, licence_id, standard_label, section_label)
  select distinct p_staff_id, lic, cov.standard_label, cov.section_label
  from _em_cov cov;
end;
$$;

create or replace function public.school_learning_report(p_licence_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor jsonb;
  school_name text;
  school_code text;
  mode text;
  coverage jsonb;
  pupils jsonb;
begin
  actor := public.em_report_actor(p_licence_id);
  select l.name, l.school_code into school_name, school_code
  from public.em_licences l
  where l.id = p_licence_id;

  mode := case when actor->>'kind' in ('teacher', 'tutor') then 'class' else 'standard' end;

  if actor->>'kind' = 'super' or actor->>'kind' = 'principal' then
    select coalesce(jsonb_agg(jsonb_build_object('standard', std, 'section', null) order by public.em_standard_rank(std)), '[]'::jsonb)
    into coverage
    from (
      select distinct r.standard_label as std
      from public.em_roster r
      where r.licence_id = p_licence_id and r.active is distinct from false
    ) ranks;
  elsif actor->>'kind' = 'hod' then
    select coalesce(jsonb_agg(jsonb_build_object('standard', c.standard_label, 'section', null) order by public.em_standard_rank(c.standard_label)), '[]'::jsonb)
    into coverage
    from public.em_staff_scope c
    where c.staff_id = nullif(actor->>'staff_id', '')::uuid
      and c.section_label is null;
  else
    select coalesce(jsonb_agg(jsonb_build_object('standard', c.standard_label, 'section', c.section_label) order by public.em_standard_rank(c.standard_label), c.section_label), '[]'::jsonb)
    into coverage
    from public.em_staff_scope c
    where c.staff_id = nullif(actor->>'staff_id', '')::uuid
      and c.section_label is not null;
  end if;

  select coalesce(jsonb_agg(pupil order by public.em_standard_rank(pupil->>'standard'), pupil->>'section', pupil->>'name'), '[]'::jsonb)
  into pupils
  from (
    select jsonb_build_object(
      'admission', r.admission_no,
      'name', r.student_name,
      'standard', r.standard_label,
      'section', r.section_label,
      'seen', coalesce(prog.seen, 0),
      'mastered', coalesce(prog.mastered, 0),
      'correct', coalesce(prog.correct, 0),
      'wrong', coalesce(prog.wrong, 0),
      'last_seen', case when prog.last_seen is null then null else to_char(prog.last_seen, 'YYYY-MM-DD') end,
      'reviews', coalesce(act.reviews, 0),
      'learned', coalesce(act.learned, 0),
      'xp', coalesce(act.xp, 0)
    ) as pupil
    from public.em_roster r
    left join lateral (
      select
        count(*)::int as seen,
        count(*) filter (where w.box >= 4)::int as mastered,
        coalesce(sum(w.correct_count), 0)::int as correct,
        coalesce(sum(w.wrong_count), 0)::int as wrong,
        max(w.last_seen_at) as last_seen
      from public.learner_word_progress w
      where r.user_id is not null and w.user_id = r.user_id
    ) prog on true
    left join lateral (
      select
        coalesce(sum(a.reviews), 0)::int as reviews,
        coalesce(sum(a.words_learned), 0)::int as learned,
        coalesce(sum(a.xp), 0)::int as xp
      from public.learner_daily_activity a
      where r.user_id is not null and a.user_id = r.user_id
    ) act on true
    where r.licence_id = p_licence_id
      and r.active is distinct from false
      and (
        actor->>'kind' in ('super', 'principal')
        or (
          actor->>'kind' = 'hod'
          and exists (
            select 1 from public.em_staff_scope c
            where c.staff_id = nullif(actor->>'staff_id', '')::uuid
              and c.section_label is null
              and c.standard_label = r.standard_label
          )
        )
        or (
          actor->>'kind' in ('teacher', 'tutor')
          and exists (
            select 1 from public.em_staff_scope c
            where c.staff_id = nullif(actor->>'staff_id', '')::uuid
              and c.standard_label = r.standard_label
              and c.section_label = r.section_label
          )
        )
      )
  ) listed;

  return jsonb_build_object(
    'school', school_name,
    'code', school_code,
    'mode', mode,
    'needs_assignment', actor->>'kind' in ('hod', 'teacher', 'tutor') and jsonb_array_length(coalesce(coverage, '[]'::jsonb)) = 0,
    'coverage', coalesce(coverage, '[]'::jsonb),
    'students', coalesce(pupils, '[]'::jsonb)
  );
end;
$$;

revoke all on function public.em_report_actor(uuid) from public;
revoke all on function public.list_school_coverage(uuid) from public;
revoke all on function public.set_staff_coverage(uuid, jsonb) from public;
revoke all on function public.school_learning_report(uuid) from public;
grant execute on function public.list_school_coverage(uuid) to authenticated;
grant execute on function public.set_staff_coverage(uuid, jsonb) to authenticated;
grant execute on function public.school_learning_report(uuid) to authenticated;
