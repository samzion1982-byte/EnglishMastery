-- Compatibility repair for SQL copies that revoke the removed legacy function.
-- This function deliberately refuses access; activation uses the Google CSV API.
create or replace function public.resume_individual_session(p_device text)
returns boolean
language plpgsql
set search_path = public
as $$
begin
 raise exception 'Legacy licence login is disabled. Use the Google CSV licence login.';
end;
$$;
revoke all on function public.resume_individual_session(text)
from public, anon, authenticated;
