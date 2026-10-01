-- Dictionary details and Tamil/Hindi translations, looked up once per word by the admin "Word details" queue
-- and read by students, so the online services are not called again for every student.
-- Teacher overrides and teacher-entered meaning_ta / meaning_hi always take priority over these.
-- Run after 20260923160000_batch_size.sql.

alter table public.core_words add column if not exists enrichment jsonb;
alter table public.core_words add column if not exists enriched_at timestamptz;
alter table public.core_words add column if not exists auto_ta text;
alter table public.core_words add column if not exists auto_hi text;
alter table public.core_words add column if not exists translated_at timestamptz;
alter table public.core_words add column if not exists enrich_attempts smallint not null default 0;
alter table public.core_words add column if not exists enrich_error text;

create index if not exists core_words_enrich_pending_idx
  on public.core_words (list_order)
  where enriched_at is null or translated_at is null;
