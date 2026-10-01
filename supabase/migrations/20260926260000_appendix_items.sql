-- Appendix words filed under a category or sub-category.
-- A word may sit in more than one place. Moving it changes category_id on that row only.
-- Creates the category table too, when that earlier migration was never applied.

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

create table if not exists public.appendix_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.appendix_categories (id) on delete cascade,
  lemma text not null,
  display_word text not null,
  sort_order int not null default 0,
  status text not null default 'published' check (status in ('published', 'retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appendix_items_place_key unique (category_id, lemma)
);

create index if not exists appendix_items_category_idx
  on public.appendix_items (category_id, sort_order);

drop trigger if exists appendix_items_updated_at on public.appendix_items;
create trigger appendix_items_updated_at
  before update on public.appendix_items
  for each row execute procedure public.set_updated_at();

-- True when this category and every category above it are turned on.
create or replace function public.appendix_category_visible(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with recursive chain as (
    select id, parent_id, is_enabled
    from public.appendix_categories
    where id = p_id
    union all
    select c.id, c.parent_id, c.is_enabled
    from public.appendix_categories c
    join chain on c.id = chain.parent_id
  )
  select coalesce(bool_and(is_enabled), false) from chain;
$$;

alter table public.appendix_items enable row level security;

drop policy if exists appendix_items_read on public.appendix_items;
create policy appendix_items_read on public.appendix_items
  for select to authenticated
  using (
    public.is_admin_staff()
    or (
      status = 'published'
      and public.appendix_category_visible(category_id)
    )
  );

drop policy if exists appendix_items_write on public.appendix_items;
create policy appendix_items_write on public.appendix_items
  for all to authenticated
  using (public.is_admin_staff())
  with check (public.is_admin_staff());

grant select, insert, update, delete on public.appendix_items to authenticated;
grant execute on function public.appendix_category_visible(uuid) to authenticated;
