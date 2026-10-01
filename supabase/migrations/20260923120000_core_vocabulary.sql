-- English Mastery — Core Vocabulary foundation
-- Run in the hosted Supabase SQL editor as a project owner.
-- Do not grant the anon key insert/update/delete on these tables.
-- Super Admin is profiles.role = 'super_admin' only. Never take that role from signup metadata.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'student'
    check (role in ('student', 'parent', 'teacher', 'school_admin', 'super_admin')),
  display_name text,
  mother_tongue text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  sort_order int not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.core_uploads (
  id uuid primary key default gen_random_uuid(),
  original_name text,
  word_count int not null default 0,
  filed int not null default 0,
  merged int not null default 0,
  queued int not null default 0,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.core_words (
  id uuid primary key default gen_random_uuid(),
  lemma text not null,
  display_word text not null,
  bucket text not null check (bucket in ('beginner', 'intermediate', 'advanced')),
  status text not null default 'published' check (status in ('draft', 'published', 'retired')),
  list_order bigint not null,
  part_of_speech text,
  meaning text,
  meaning_ta text,
  meaning_hi text,
  synonym text,
  antonym text,
  examples jsonb not null default '[]'::jsonb,
  distractors jsonb not null default '[]'::jsonb,
  confidence smallint check (confidence between 0 and 100),
  classified_by text check (classified_by in ('reference_list', 'heuristic', 'model', 'human')),
  upload_id uuid references public.core_uploads (id) on delete set null,
  is_new boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (lemma)
);

create unique index if not exists core_words_bucket_order_uidx
  on public.core_words (bucket, list_order);

create index if not exists core_words_bucket_status_idx
  on public.core_words (bucket, status);

create index if not exists core_words_new_idx
  on public.core_words (is_new) where is_new;

create table if not exists public.core_review_queue (
  id uuid primary key default gen_random_uuid(),
  lemma text not null,
  display_word text not null,
  suggested_bucket text not null check (suggested_bucket in ('beginner', 'intermediate', 'advanced')),
  confidence smallint check (confidence between 0 and 100),
  reason text,
  status text not null default 'open' check (status in ('open', 'accepted', 'skipped')),
  resolved_bucket text check (resolved_bucket in ('beginner', 'intermediate', 'advanced')),
  word_id uuid references public.core_words (id) on delete set null,
  upload_id uuid references public.core_uploads (id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create unique index if not exists core_review_open_lemma_uidx
  on public.core_review_queue (lemma) where status = 'open';

create table if not exists public.learner_word_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  word_id uuid not null references public.core_words (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

create table if not exists public.learner_bucket_prefs (
  user_id uuid not null references public.profiles (id) on delete cascade,
  bucket text not null check (bucket in ('beginner', 'intermediate', 'advanced')),
  batch_size int not null check (batch_size in (25, 50, 75, 100)),
  updated_at timestamptz not null default now(),
  primary key (user_id, bucket)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists core_words_updated_at on public.core_words;
create trigger core_words_updated_at
  before update on public.core_words
  for each row execute procedure public.set_updated_at();

-- Next list_order in a bucket. Duplicates never get a new order; they merge onto the existing row.
create or replace function public.next_core_list_order(p_bucket text)
returns bigint
language sql
stable
as $$
  select coalesce(max(list_order), 0) + 1 from public.core_words where bucket = p_bucket;
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

insert into public.app_modules (slug, title, description, sort_order, is_enabled)
values
  ('core-vocabulary', 'Core Vocabulary', 'Beginner, Intermediate and Advanced buckets. Lists append as you upload.', 10, true),
  ('appendix', 'Appendix', 'Separate from Core. Not in live student scores yet.', 20, false)
on conflict (slug) do nothing;

alter table public.profiles enable row level security;
alter table public.app_modules enable row level security;
alter table public.core_uploads enable row level security;
alter table public.core_words enable row level security;
alter table public.core_review_queue enable row level security;
alter table public.learner_word_progress enable row level security;
alter table public.learner_bucket_prefs enable row level security;

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_super_admin());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists modules_read on public.app_modules;
create policy modules_read on public.app_modules
  for select to authenticated
  using (true);

drop policy if exists modules_admin_write on public.app_modules;
create policy modules_admin_write on public.app_modules
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists core_words_student_read on public.core_words;
create policy core_words_student_read on public.core_words
  for select to authenticated
  using (status = 'published' or public.is_super_admin());

drop policy if exists core_words_admin_write on public.core_words;
create policy core_words_admin_write on public.core_words
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists core_review_admin on public.core_review_queue;
create policy core_review_admin on public.core_review_queue
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists core_uploads_admin on public.core_uploads;
create policy core_uploads_admin on public.core_uploads
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists progress_own on public.learner_word_progress;
create policy progress_own on public.learner_word_progress
  for all to authenticated
  using (user_id = auth.uid() or public.is_super_admin())
  with check (user_id = auth.uid() or public.is_super_admin());

drop policy if exists prefs_own on public.learner_bucket_prefs;
create policy prefs_own on public.learner_bucket_prefs
  for all to authenticated
  using (user_id = auth.uid() or public.is_super_admin())
  with check (user_id = auth.uid() or public.is_super_admin());

grant usage on schema public to anon, authenticated;
grant select on public.app_modules to authenticated;
grant select on public.core_words to authenticated;
grant select, insert, update, delete on public.learner_word_progress to authenticated;
grant select, insert, update, delete on public.learner_bucket_prefs to authenticated;
grant select, update on public.profiles to authenticated;
