-- School staff use the Permissions checkboxes for their level.
-- Principal is Level 4, HOD is Level 3, Teacher is Level 2, Tutor is Level 1.
-- Run this once in the Supabase SQL editor, then sign in again.

create or replace function public.my_page_grants()
returns table (page_key text, allowed boolean)
language sql
stable
security definer
set search_path = public
as $$
  select g.page_key, g.allowed
  from public.em_role_page_access g
  where g.role = coalesce(
    (
      select case s.designation
        when 'principal' then 'user4'
        when 'hod' then 'demo'
        when 'teacher' then 'user'
        when 'tutor' then 'admin'
        else null
      end
      from public.em_school_staff s
      where s.user_id = auth.uid()
        and coalesce(s.active, true)
      limit 1
    ),
    (
      select p.role
      from public.profiles p
      where p.id = auth.uid()
        and p.is_active is distinct from false
    )
  );
$$;

revoke all on function public.my_page_grants() from public;
grant execute on function public.my_page_grants() to authenticated;
