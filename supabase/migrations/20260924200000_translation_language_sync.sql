-- Run after 20260924190000_translation_controls.sql. Preserves all saved data and switches.
begin;
create or replace function public.translation_claim_language(p_language text) returns table(lemma text,language text,claim_id uuid)
language plpgsql security definer set search_path=public as $$
declare chosen text; token uuid:=gen_random_uuid();
begin
 perform public.translation_require_admin();
 if p_language is null or p_language not in ('ta','hi','ml','te','fr','kn') then raise exception 'Unsupported language'; end if;
 perform pg_advisory_xact_lock(73124819);
 if exists(select 1 from public.word_translations where state='processing') then return; end if;
 select l.code into chosen from public.translation_languages l
 where l.enabled and l.code=p_language and exists(select 1 from public.core_words w where w.status<>'retired'
   and not exists(select 1 from public.word_translations t where t.lemma=w.lemma and t.language=l.code)
   and (case when l.code='ta' then coalesce(nullif(w.meaning_ta,''),nullif(w.auto_ta,'')) when l.code='hi' then coalesce(nullif(w.meaning_hi,''),nullif(w.auto_hi,'')) end) is null)
 order by l.priority limit 1;
 if chosen is null then return; end if;
 return query
 insert into public.word_translations as saved(lemma,language,state,claim_id)
 select w.lemma,chosen,'processing',token from public.core_words w
 where w.status<>'retired' and not exists(select 1 from public.word_translations t where t.lemma=w.lemma and t.language=chosen)
 and (case when chosen='ta' then coalesce(nullif(w.meaning_ta,''),nullif(w.auto_ta,'')) when chosen='hi' then coalesce(nullif(w.meaning_hi,''),nullif(w.auto_hi,'')) end) is null
 order by w.list_order,w.lemma limit 10
 on conflict do nothing returning saved.lemma,saved.language,saved.claim_id;
end $$;
revoke all on function public.translation_claim_language(text) from public;
grant execute on function public.translation_claim_language(text) to authenticated;
commit;
