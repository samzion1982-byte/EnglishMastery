alter table public.profiles
  add column if not exists country text not null default 'IN';
