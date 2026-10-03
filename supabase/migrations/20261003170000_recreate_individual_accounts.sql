begin;
-- Recreating an individual after licence deletion must not collide with its retained login.
create or replace function public.provision_individual_learner(p_licence_id uuid,p_email text,p_name text,p_role text default 'student') returns uuid language plpgsql security definer set search_path=public as $$
declare existing_role text; individual_origin boolean; uid uuid; mail text:=lower(btrim(p_email)); lic public.em_licences;
begin
 if not public.is_super_admin() then raise exception 'Super Admin required'; end if;
 if p_role is null or p_role not in ('student','admin1','user4','demo','user','admin') then raise exception 'Invalid access level'; end if;
 if mail is null or mail !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then raise exception 'A valid learner email is required'; end if;
 select * into lic from public.em_licences where id=p_licence_id and kind='individual' for update;
 if not found then raise exception 'Individual licence not found'; end if;
 select id, coalesce(raw_app_meta_data->>'em_individual_account','false')='true' into uid,individual_origin from auth.users where lower(email)=mail for update;
 if uid is not null then
  select role into existing_role from public.profiles where id=uid for update;
  if existing_role is null or existing_role='super_admin' or (existing_role<>'student' and not individual_origin) then
   raise exception 'That email belongs to an existing staff account. Use another email.';
  end if;
  if exists(select 1 from public.em_roster where user_id=uid) or exists(select 1 from public.em_school_staff where user_id=uid) then
   raise exception 'That email belongs to a school account.';
  end if;
  if exists(select 1 from public.em_individual_members where user_id=uid) then
   raise exception 'That email is already assigned to an individual licence.';
  end if;
  if (select count(*) from public.em_individual_members where licence_id=lic.id)>=lic.seats then raise exception 'This licence has no free seats'; end if;
  -- Reuse an unassigned account left behind by a deleted licence; keep its user ID and learning history.
  update auth.users set encrypted_password=extensions.crypt('123456',extensions.gen_salt('bf')),
   raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb)||jsonb_build_object('em_individual_account',true),updated_at=now() where id=uid;
  update public.profiles set email=mail,display_name=btrim(p_name),role=p_role,is_active=true,must_change_password=true where id=uid;
  delete from public.em_individual_sessions where user_id=uid;
  delete from public.em_individual_devices where user_id=uid;
  insert into public.em_individual_members(licence_id,user_id) values(lic.id,uid);
  perform public.em_log_licence_event(lic.id,'learner','Recreated access for unassigned account '||mail||' as '||p_role);
  return uid;
 end if;
 if (select count(*) from public.em_individual_members where licence_id=lic.id)>=lic.seats then raise exception 'This licence has no free seats'; end if;
 uid:=gen_random_uuid();
 insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
 values('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',mail,extensions.crypt('123456',extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"],"em_individual_account":true}'::jsonb,jsonb_build_object('display_name',btrim(p_name)),now(),now(),'','','','');
 insert into auth.identities(id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
 values(gen_random_uuid(),uid,jsonb_build_object('sub',uid::text,'email',mail,'email_verified',true),'email',uid::text,now(),now(),now());
 insert into public.profiles(id,email,display_name,role,is_active,must_change_password) values(uid,mail,btrim(p_name),p_role,true,true)
 on conflict(id) do update set email=excluded.email,display_name=excluded.display_name,role=excluded.role,is_active=true,must_change_password=true;
 insert into public.em_individual_members(licence_id,user_id) values(lic.id,uid);
 perform public.em_log_licence_event(lic.id,'learner','Created '||mail||' as '||p_role);
 return uid;
end $$;
revoke all on function public.provision_individual_learner(uuid,text,text,text) from public;
grant execute on function public.provision_individual_learner(uuid,text,text,text) to authenticated;
commit;
