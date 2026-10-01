-- Academic year on a school, and registration dates follow the India calendar.
-- Run this once in the Supabase SQL editor. Do not re-run the earlier licence files.

alter table public.em_licences add column if not exists academic_year text;

alter table public.em_licences drop constraint if exists em_licences_academic_year_check;
alter table public.em_licences
  add constraint em_licences_academic_year_check
  check (
    academic_year is null
    or (
      academic_year ~ '^20[0-9]{2}-[0-9]{2}$'
      and right(academic_year, 2)::int = (left(academic_year, 4)::int + 1) % 100
    )
  );

create or replace function public.em_india_today()
returns date
language sql
stable
as $$
  select (timezone('Asia/Kolkata', now()))::date;
$$;

create or replace function public.school_join_info(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  lic public.em_licences;
  today date := public.em_india_today();
  open_now boolean;
begin
  select * into lic
  from public.em_licences
  where kind = 'school' and school_code is not null and upper(school_code) = upper(btrim(p_code))
  limit 1;
  if not found then
    return jsonb_build_object('ok', false);
  end if;
  open_now := lic.status = 'active'
    and lic.accepting_devices
    and lic.valid_from <= today
    and (lic.valid_until is null or lic.valid_until >= today);
  return jsonb_build_object(
    'ok', true,
    'name', lic.name,
    'open', open_now,
    'reason', case
      when lic.status <> 'active' then 'suspended'
      when not lic.accepting_devices then 'blocked'
      when lic.valid_from > today then 'not_started'
      when lic.valid_until is not null and lic.valid_until < today then 'ended'
      else null
    end,
    'starts', lic.valid_from
  );
end;
$$;

revoke all on function public.school_join_info(text) from public;
grant execute on function public.school_join_info(text) to anon, authenticated;

do $$
declare
  src text;
begin
  src := pg_get_functiondef('public.join_school(text,text,text,text)'::regprocedure);
  if position('em_india_today' in src) = 0 then
    execute replace(src, 'current_date', 'public.em_india_today()');
  end if;
end $$;
