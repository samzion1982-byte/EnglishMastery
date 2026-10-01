-- Super Admin licence register for schools and individual families.
-- Seat limits and status are recorded here. The student app does not enforce them yet.

create table if not exists public.em_licences (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  name text not null,
  contact_email text,
  seats int not null default 1,
  valid_from date not null default current_date,
  valid_until date,
  status text not null default 'active',
  accepting_devices boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint em_licences_kind_check check (kind in ('school', 'individual')),
  constraint em_licences_status_check check (status in ('active', 'suspended')),
  constraint em_licences_seats_check check (seats between 0 and 20000),
  constraint em_licences_name_check check (char_length(btrim(name)) between 1 and 160),
  constraint em_licences_dates_check check (valid_until is null or valid_until >= valid_from)
);

create index if not exists em_licences_kind_name_idx on public.em_licences (kind, lower(name));

create or replace function public.touch_em_licences()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists em_licences_touch on public.em_licences;
create trigger em_licences_touch
  before update on public.em_licences
  for each row execute procedure public.touch_em_licences();

alter table public.em_licences enable row level security;

drop policy if exists em_licences_super_admin on public.em_licences;
create policy em_licences_super_admin on public.em_licences
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant select, insert, update, delete on public.em_licences to authenticated;
