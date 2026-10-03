-- Read-only: identify why an email cannot be used for individual recreation.
-- No password, token or credential data is returned.
select
 u.email,
 coalesce(p.role, 'PROFILE MISSING') as account_role,
 coalesce(u.raw_app_meta_data->>'em_individual_account', 'false') as created_as_individual,
 exists(select 1 from public.em_individual_members m where m.user_id=u.id) as has_individual_licence,
 exists(select 1 from public.em_roster r where r.user_id=u.id) as is_school_student,
 exists(select 1 from public.em_school_staff s where s.user_id=u.id) as is_school_staff
from auth.users u
left join public.profiles p on p.id=u.id
where lower(u.email)=lower('cysiljason@gmail.com');
