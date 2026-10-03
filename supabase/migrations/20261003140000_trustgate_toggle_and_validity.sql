begin;
-- Supabase safe-update mode requires a WHERE clause for session invalidation.
create or replace function public.set_trustgate_required(p_required boolean) returns void
language plpgsql security definer set search_path=public as $$
begin
 if not public.is_super_admin() then raise exception 'Super Admin required'; end if;
 if p_required is null then raise exception 'Choose on or off'; end if;
 update public.em_auth_settings set require_trustgate=p_required where id=true;
 if p_required then delete from public.em_individual_sessions where session_id is not null; end if;
end $$;
revoke all on function public.set_trustgate_required(boolean) from public;
grant execute on function public.set_trustgate_required(boolean) to authenticated;
-- Expose only the current user's validity, without granting access to licence keys.
create function public.my_individual_validity() returns jsonb
language sql stable security definer set search_path=public as $$
 select jsonb_build_object('valid_until',l.valid_until)
 from public.em_individual_members m join public.em_licences l on l.id=m.licence_id
 where m.user_id=auth.uid() and l.kind='individual';
$$;
revoke all on function public.my_individual_validity() from public;
grant execute on function public.my_individual_validity() to authenticated;
commit;
