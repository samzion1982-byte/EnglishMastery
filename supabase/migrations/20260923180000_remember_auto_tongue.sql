-- Lets a student live-lookup fill empty Tamil/Hindi columns once, so Azure is not called again.
-- Does not overwrite a teacher-entered meaning or a value the admin queue already saved.
-- Run after 20260923170000_word_enrichment.sql.

create or replace function public.remember_auto_tongue(p_lemma text, p_ta text, p_hi text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.core_words
  set
    auto_ta = coalesce(auto_ta, nullif(btrim(coalesce(p_ta, '')), '')),
    auto_hi = coalesce(auto_hi, nullif(btrim(coalesce(p_hi, '')), '')),
    translated_at = coalesce(translated_at, now())
  where lemma = p_lemma
    and translated_at is null;
end;
$$;

revoke all on function public.remember_auto_tongue(text, text, text) from public;
grant execute on function public.remember_auto_tongue(text, text, text) to authenticated;
