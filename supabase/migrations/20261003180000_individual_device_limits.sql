begin;
alter table public.em_licences add column device_limit integer not null default 1 check(device_limit between 1 and 10);
alter table public.em_individual_devices drop constraint em_individual_devices_pkey;
alter table public.em_individual_devices add primary key(user_id,device_id);
-- Each new individual is one learner; device allowance is a separate setting.
alter function public.create_individual_account(jsonb,text) rename to create_individual_account_base;
revoke all on function public.create_individual_account_base(jsonb,text) from public,anon,authenticated;
create function public.create_individual_account(p_details jsonb,p_role text default 'student') returns uuid
language plpgsql security definer set search_path=public as $$
declare lid uuid; devices integer:=coalesce((p_details->>'device_limit')::integer,1);
begin
 if not public.is_super_admin() then raise exception 'Super Admin required'; end if;
 if devices not between 1 and 10 then raise exception 'Number of devices must be between 1 and 10'; end if;
 lid:=public.create_individual_account_base(p_details||jsonb_build_object('seats',1),p_role);
 update public.em_licences set device_limit=devices where id=lid;
 return lid;
end $$;
revoke all on function public.create_individual_account(jsonb,text) from public;
grant execute on function public.create_individual_account(jsonb,text) to authenticated;
create or replace function public.activate_csv_individual_session(p_device text) returns void
language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); sid uuid:=(auth.jwt()->>'session_id')::uuid; lic public.em_licences; device text:=lower(btrim(p_device));
begin
 if uid is null or sid is null then raise exception 'Sign in first'; end if;
 select l.* into lic from public.em_individual_members m join public.em_licences l on l.id=m.licence_id where m.user_id=uid and l.kind='individual' for update of l;
 if not found or lic.status<>'active' or lic.valid_from>public.em_india_today() then raise exception 'This individual licence is not active'; end if;
 if not exists(select 1 from public.profiles where id=uid and is_active) then raise exception 'This account is inactive'; end if;
 if not exists(select 1 from public.em_csv_licences c where c.user_id=uid and c.licence_id=lic.id and c.valid_until>=public.em_india_today() and c.checked_at>now()-interval '30 seconds') then raise exception 'Verify the licence sheet first'; end if;
 if public.trustgate_required() then
  if device is null or device !~ '^[a-z0-9][a-z0-9._:-]{7,79}$' then raise exception 'Open the companion app on this computer'; end if;
  if not exists(select 1 from public.em_individual_devices where user_id=uid and device_id=device) then
   if not lic.accepting_devices then raise exception 'Device registration is closed'; end if;
   if (select count(*) from public.em_individual_devices where user_id=uid)>=lic.device_limit then
    raise exception 'The allowed number of devices has been reached. Ask Super Admin to reset devices or increase the limit.';
   end if;
   insert into public.em_individual_devices(user_id,device_id) values(uid,device);
  end if;
 end if;
 insert into public.em_individual_sessions(session_id,user_id,licence_id) values(sid,uid,lic.id) on conflict(session_id) do nothing;
end $$;
create function public.check_individual_device_limit() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if new.kind='individual' and new.device_limit<old.device_limit and exists(
  select 1 from public.em_individual_members m join public.em_individual_devices d on d.user_id=m.user_id
  where m.licence_id=new.id group by m.user_id having count(*)>new.device_limit
 ) then raise exception 'Reset registered devices before reducing the device limit.'; end if;
 return new;
end $$;
revoke all on function public.check_individual_device_limit() from public;
create trigger em_check_individual_device_limit before update of device_limit on public.em_licences for each row execute function public.check_individual_device_limit();
commit;
