begin;
alter table public.em_licences add column if not exists login_email text;
create function public.save_individual_purchase(p_details jsonb,p_role text default 'student') returns jsonb
language plpgsql security definer set search_path=public as $$
declare lid uuid; uid uuid; purchaser text:=lower(btrim(p_details->>'contact_email')); login text:=lower(btrim(p_details->>'login_email')); code text:=upper(btrim(p_details->>'auth_code')); existing boolean:=false; current_role text; devices integer:=(p_details->>'device_limit')::integer;
begin
 if not public.is_super_admin() then raise exception 'Super Admin required'; end if;
 if purchaser is null or purchaser !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' or login is null or login !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' or code is null or code='' then raise exception 'Purchaser email, login email and Auth Code are required'; end if;
 if p_role is null or p_role not in ('student','admin1','user4','demo','user','admin') or devices is null or devices not between 1 and 10 then raise exception 'Invalid access level or device limit'; end if;
 if nullif(p_details->>'id','') is not null then
  lid:=(p_details->>'id')::uuid;
  perform 1 from public.em_licences where id=lid and kind='individual' for update;
  if not found then raise exception 'Individual purchase not found'; end if;
  select m.user_id,p.role into uid,current_role from public.em_individual_members m join public.profiles p on p.id=m.user_id where m.licence_id=lid;
  if uid is null or not exists(select 1 from auth.users where id=uid and lower(email)=login) then raise exception 'Login email cannot be reassigned here. Create a separate purchase for another login.'; end if;
  existing:=true;
  update public.em_licences set name=p_details->>'name',contact_email=purchaser,login_email=login,licence_key=code,valid_until=(p_details->>'valid_until')::date,status=p_details->>'status',device_limit=devices where id=lid;
 else
  select u.id,p.role into uid,current_role from auth.users u left join public.profiles p on p.id=u.id where lower(u.email)=login for update of u;
  existing:=uid is not null;
  if existing then
   if current_role is null then raise exception 'The existing login profile is missing. Repair it before assigning a purchase.'; end if;
   if current_role='super_admin' then raise exception 'Use a separate login email for an individual licence. The purchaser email may still be Super Admin.'; end if;
   if exists(select 1 from public.em_roster where user_id=uid) or exists(select 1 from public.em_school_staff where user_id=uid) then raise exception 'The login belongs to a school account. Use a separate login email.'; end if;
   if exists(select 1 from public.em_individual_members where user_id=uid) then raise exception 'This login already has an individual purchase. Edit that purchase instead.'; end if;
  end if;
  insert into public.em_licences(kind,name,contact_email,login_email,seats,valid_from,valid_until,status,device_limit,accepting_devices,second_device_policy,licence_key)
  values('individual',p_details->>'name',purchaser,login,1,public.em_india_today(),(p_details->>'valid_until')::date,p_details->>'status',devices,true,'refuse',code) returning id into lid;
  if existing then insert into public.em_individual_members(licence_id,user_id) values(lid,uid);
  else uid:=public.provision_individual_learner(lid,login,p_details->>'name',p_role); end if;
 end if;
 -- Admin assigns the purchaser/key/login mapping before any individual sign-in.
 insert into public.em_csv_licences(user_id,licence_id,auth_code,valid_until,checked_at) values(uid,lid,code,(p_details->>'valid_until')::date,now())
 on conflict(user_id) do update set licence_id=excluded.licence_id,auth_code=excluded.auth_code,valid_until=excluded.valid_until,checked_at=now();
 delete from public.em_individual_sessions where user_id=uid;
 perform public.em_log_licence_event(lid,'purchase','Assigned purchase to login '||login);
 return jsonb_build_object('id',lid,'existingUser',existing,'role',coalesce(current_role,p_role));
end $$;
create or replace function public.my_csv_licence_context() returns jsonb language sql stable security definer set search_path=public as $$
 select jsonb_build_object('key',c.auth_code,'purchaser_email',l.contact_email,'login_email',coalesce(l.login_email,p.email))
 from public.em_individual_members m join public.em_licences l on l.id=m.licence_id join public.profiles p on p.id=m.user_id
 left join public.em_csv_licences c on c.user_id=m.user_id and c.licence_id=m.licence_id
 where m.user_id=auth.uid() and l.kind='individual';
$$;
revoke all on function public.save_individual_purchase(jsonb,text) from public;
grant execute on function public.save_individual_purchase(jsonb,text) to authenticated;
commit;
