-- Meanings, word types, synonyms and antonyms are fetched live from online dictionaries.
-- Only teacher changes (hidden meanings, custom main meaning, added meanings, synonym/antonym lists) are stored.
-- Run after 20260923140000_student_learning.sql.

alter table public.core_words add column if not exists overrides jsonb not null default '{}'::jsonb;
