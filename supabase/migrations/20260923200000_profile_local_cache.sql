-- English Mastery: keep a device word cache, chosen in Profile.
-- Run in the hosted Supabase SQL editor after 20260923190000_profile_country.sql.

alter table public.profiles
  add column if not exists local_cache boolean not null default true;
