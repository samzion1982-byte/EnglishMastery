-- Reports need the school id for the signed-in staff member.
-- The overview can show the school name without it. Run this once, then open Reports again.

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
    and coalesce(s.active, true)
  limit 1;
  return result;
end;
$$;

revoke all on function public.my_school_staff() from public;
grant execute on function public.my_school_staff() to authenticated;
