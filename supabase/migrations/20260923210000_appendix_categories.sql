-- Appendix categories and nested sub-categories.
-- Run after the earlier English Mastery migrations.

create table if not exists public.appendix_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.appendix_categories (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appendix_categories_parent_idx
  on public.appendix_categories (parent_id, sort_order);

create unique index if not exists appendix_categories_sibling_name_uidx
  on public.appendix_categories (coalesce(parent_id, '00000000-0000-0000-0000-000000000000'), lower(name));

drop trigger if exists appendix_categories_updated_at on public.appendix_categories;
create trigger appendix_categories_updated_at
  before update on public.appendix_categories
  for each row execute procedure public.set_updated_at();

alter table public.appendix_categories enable row level security;

drop policy if exists appendix_categories_read on public.appendix_categories;
create policy appendix_categories_read on public.appendix_categories
  for select to authenticated
  using (public.is_admin_staff() or is_enabled);

drop policy if exists appendix_categories_write on public.appendix_categories;
create policy appendix_categories_write on public.appendix_categories
  for all to authenticated
  using (public.is_admin_staff())
  with check (public.is_admin_staff());

grant select, insert, update, delete on public.appendix_categories to authenticated;
