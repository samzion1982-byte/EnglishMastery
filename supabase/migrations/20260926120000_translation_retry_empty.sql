-- Run after 20260924200000_translation_language_sync.sql.
-- Lets Super Admin release words Azure returned blank for, so they can be requested once more.
begin;
create or replace function public.translation_retry(p_language text) returns void
language plpgsql security definer set search_path=public as $$
begin
 perform public.translation_require_admin();
 delete from public.word_translations where language=p_language and
 (state in ('failed','empty') or (state='processing' and updated_at<now()-interval '10 minutes'));
end $$;
commit;
