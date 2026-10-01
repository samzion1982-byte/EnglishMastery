-- English Mastery: words per level, chosen by each student.
-- Run in the hosted Supabase SQL editor after 20260923150000_word_overrides.sql.

alter table public.profiles
  add column if not exists batch_size smallint not null default 50
    check (batch_size between 5 and 200);
