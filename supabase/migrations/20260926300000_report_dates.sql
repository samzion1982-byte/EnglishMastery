-- Period reports: one row per class the caller is allowed to see.
-- Activity is counted only between the chosen dates.
-- Run after 20260926290000_school_reports.sql.

create or replace function public.em_tracker_on(p_licence_id uuid)
returns date
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select e.created_at::date
      from public.em_licence_events e
      where e.licence_id = p_licence_id and e.action = 'roster'
      order by e.created_at desc
      limit 1
    ),
    (
      select make_date(substring(l.academic_year, 1, 4)::int, 6, 1)
      from public.em_licences l
      where l.id = p_licence_id and l.academic_year ~ '^20[0-9]{2}-[0-9]{2}$'
    ),
    (select l.valid_from from public.em_licences l where l.id = p_licence_id),
    current_date
  );
$$;

create or replace function public.school_tracker_date(p_licence_id uuid)
returns date
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.em_report_actor(p_licence_id);
  return public.em_tracker_on(p_licence_id);
end;
$$;

drop function if exists public.school_learning_report(uuid);

create or replace function public.school_learning_report(p_licence_id uuid, p_from date, p_to date)
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
  span_from date;
  span_to date;
  coverage jsonb;
  pupils jsonb;
begin
  actor := public.em_report_actor(p_licence_id);
  span_to := coalesce(p_to, current_date);
  span_from := coalesce(p_from, public.em_tracker_on(p_licence_id));
  if span_from > span_to then
    raise exception 'The start date must be on or before the end date';
  end if;

  select l.name, l.school_code into school_name, school_code
  from public.em_licences l
  where l.id = p_licence_id;

  if actor->>'kind' = 'super' or actor->>'kind' = 'principal' then
    select coalesce(jsonb_agg(jsonb_build_object('standard', standard_label, 'section', section_label) order by public.em_standard_rank(standard_label), section_label), '[]'::jsonb)
    into coverage
    from (
      select distinct r.standard_label, r.section_label
      from public.em_roster r
      where r.licence_id = p_licence_id and r.active is distinct from false
    ) rooms;
  elsif actor->>'kind' = 'hod' then
    select coalesce(jsonb_agg(jsonb_build_object('standard', standard_label, 'section', section_label) order by public.em_standard_rank(standard_label), section_label), '[]'::jsonb)
    into coverage
    from (
      select distinct r.standard_label, r.section_label
      from public.em_roster r
      where r.licence_id = p_licence_id
        and r.active is distinct from false
        and exists (
          select 1 from public.em_staff_scope c
          where c.staff_id = nullif(actor->>'staff_id', '')::uuid
            and c.section_label is null
            and c.standard_label = r.standard_label
        )
    ) rooms;
  else
    select coalesce(jsonb_agg(jsonb_build_object('standard', c.standard_label, 'section', c.section_label) order by public.em_standard_rank(c.standard_label), c.section_label), '[]'::jsonb)
    into coverage
    from public.em_staff_scope c
    where c.staff_id = nullif(actor->>'staff_id', '')::uuid
      and c.section_label is not null
      and exists (
        select 1 from public.em_roster r
        where r.licence_id = p_licence_id
          and r.active is distinct from false
          and r.standard_label = c.standard_label
          and r.section_label = c.section_label
      );
  end if;

  select coalesce(jsonb_agg(pupil order by public.em_standard_rank(pupil->>'standard'), pupil->>'section', pupil->>'name'), '[]'::jsonb)
  into pupils
  from (
    select jsonb_build_object(
      'admission', r.admission_no,
      'name', r.student_name,
      'standard', r.standard_label,
      'section', r.section_label,
      'learned', coalesce(act.learned, 0),
      'reviews', coalesce(act.reviews, 0),
      'correct', coalesce(act.correct, 0),
      'xp', coalesce(act.xp, 0),
      'last_seen', act.last_day
    ) as pupil
    from public.em_roster r
    left join lateral (
      select
        coalesce(sum(a.words_learned), 0)::int as learned,
        coalesce(sum(a.reviews), 0)::int as reviews,
        coalesce(sum(a.correct), 0)::int as correct,
        coalesce(sum(a.xp), 0)::int as xp,
        to_char(max(a.day), 'YYYY-MM-DD') as last_day
      from public.learner_daily_activity a
      where r.user_id is not null
        and a.user_id = r.user_id
        and a.day between span_from and span_to
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
    'mode', 'class',
    'from', span_from,
    'to', span_to,
    'needs_assignment', actor->>'kind' in ('hod', 'teacher', 'tutor') and jsonb_array_length(coalesce(coverage, '[]'::jsonb)) = 0,
    'coverage', coalesce(coverage, '[]'::jsonb),
    'students', coalesce(pupils, '[]'::jsonb)
  );
end;
$$;

revoke all on function public.em_tracker_on(uuid) from public;
revoke all on function public.school_tracker_date(uuid) from public;
revoke all on function public.school_learning_report(uuid, date, date) from public;
grant execute on function public.school_tracker_date(uuid) to authenticated;
grant execute on function public.school_learning_report(uuid, date, date) to authenticated;
