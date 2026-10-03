-- Authorised fresh start for individual purchase/licence data only.
-- Run once in the Supabase SQL editor. Staff logins, schools and learning history are retained.
begin;
lock table public.em_licences in share row exclusive mode;
create temporary table em_reset_purchase_users(user_id uuid primary key) on commit drop;
insert into em_reset_purchase_users(user_id)
 select distinct m.user_id from public.em_individual_members m
 join public.em_licences l on l.id=m.licence_id where l.kind='individual';
-- Clean optional records from the old individual implementation when present.
do $$
begin
 if to_regclass('public.em_individual_devices') is not null then
  execute 'delete from public.em_individual_devices where user_id in (select user_id from em_reset_purchase_users)';
 end if;
 if to_regclass('public.em_individual_sessions') is not null then
  execute 'delete from public.em_individual_sessions where user_id in (select user_id from em_reset_purchase_users)';
 end if;
 if to_regclass('public.em_individual_key_validations') is not null then
  execute 'delete from public.em_individual_key_validations where licence_id in (select id from public.em_licences where kind = ''individual'')';
 end if;
 if to_regclass('public.em_csv_licences') is not null then
  execute 'delete from public.em_csv_licences where licence_id in (select id from public.em_licences where kind = ''individual'')';
 end if;
end $$;
-- Existing foreign keys cascade to individual member assignments and licence events.
delete from public.em_licences where kind='individual';
commit;

select count(*) as remaining_individual_purchases from public.em_licences where kind='individual';
