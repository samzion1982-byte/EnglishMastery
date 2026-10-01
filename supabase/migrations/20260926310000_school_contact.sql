-- School contact details on the licence form: address and phone.
-- Email stays in contact_email.

alter table public.em_licences add column if not exists address text;
alter table public.em_licences add column if not exists phone text;

alter table public.em_licences drop constraint if exists em_licences_address_check;
alter table public.em_licences
  add constraint em_licences_address_check
  check (address is null or char_length(btrim(address)) between 1 and 200);

alter table public.em_licences drop constraint if exists em_licences_phone_check;
alter table public.em_licences
  add constraint em_licences_phone_check
  check (phone is null or char_length(btrim(phone)) between 6 and 20);
