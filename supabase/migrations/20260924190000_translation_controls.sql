-- Apply in the Supabase SQL editor as project owner.
-- Keeps existing Tamil/Hindi results and never changes their teacher meanings.
begin;
create table if not exists public.translation_languages (
  code text primary key check (code in ('ta','hi','ml','te','fr','kn')),
  enabled boolean not null default false,
  priority integer not null,
  updated_at timestamptz not null default now()
);
insert into public.translation_languages(code,enabled,priority) values
 ('ta',true,1),('hi',true,2),('ml',false,3),('te',false,4),('fr',false,5),('kn',false,6)
on conflict (code) do nothing;
create table if not exists public.word_translations (
  lemma text not null,
  language text not null references public.translation_languages(code),
  text text,
  state text not null check(state in ('processing','complete','empty','failed')),
  claim_id uuid,
  updated_at timestamptz not null default now(),
  error text,
  primary key(lemma,language)
);
create index if not exists word_translations_state_idx on public.word_translations(state);
alter table public.translation_languages enable row level security;
alter table public.word_translations enable row level security;
revoke all on public.translation_languages,public.word_translations from anon,authenticated;
grant select on public.translation_languages,public.word_translations to authenticated;
drop policy if exists translation_languages_read on public.translation_languages;
create policy translation_languages_read on public.translation_languages for select to authenticated using (
 exists(select 1 from public.profiles where id=auth.uid() and is_active));
drop policy if exists word_translations_read on public.word_translations;
create policy word_translations_read on public.word_translations for select to authenticated using (
 exists(select 1 from public.profiles where id=auth.uid() and is_active));

-- Backfill actual results; a legacy checked-but-empty result is tracked separately.
insert into public.word_translations(lemma,language,text,state,updated_at)
select w.lemma,l.code,nullif(btrim(case when l.code='ta' then coalesce(nullif(w.meaning_ta,''),w.auto_ta) else coalesce(nullif(w.meaning_hi,''),w.auto_hi) end),''),
 case when nullif(btrim(case when l.code='ta' then coalesce(nullif(w.meaning_ta,''),w.auto_ta) else coalesce(nullif(w.meaning_hi,''),w.auto_hi) end),'') is null then 'empty' else 'complete' end,
 coalesce(w.translated_at,now())
from public.core_words w cross join (values ('ta'),('hi')) l(code)
where w.translated_at is not null or (l.code='ta' and coalesce(nullif(w.meaning_ta,''),nullif(w.auto_ta,'')) is not null)
 or (l.code='hi' and coalesce(nullif(w.meaning_hi,''),nullif(w.auto_hi,'')) is not null)
on conflict(lemma,language) do nothing;

create or replace function public.translation_require_admin() returns void
language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='super_admin' and is_active) then
  raise exception 'Super Admin required' using errcode='42501';
 end if;
end $$;

create or replace function public.translation_set_language(p_language text,p_enabled boolean) returns void
language plpgsql security definer set search_path=public as $$
begin
 perform public.translation_require_admin();
 update public.translation_languages set enabled=p_enabled,updated_at=now() where code=p_language;
 if not found then raise exception 'Unsupported language'; end if;
end $$;

create or replace function public.translation_coverage() returns table(
 code text,enabled boolean,priority integer,total bigint,translated bigint,pending bigint,processing bigint,failed bigint,empty bigint)
language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and is_active and role in ('super_admin','admin1','admin','user','demo','user4')) then
  raise exception 'Admin required' using errcode='42501';
 end if;
 return query
 with coverage as (
 select l.code,l.enabled,l.priority,w.lemma,t.state,
 nullif(btrim(coalesce(case when l.code='ta' then nullif(w.meaning_ta,'') when l.code='hi' then nullif(w.meaning_hi,'') end,t.text,
 case when l.code='ta' then w.auto_ta when l.code='hi' then w.auto_hi end)),'') as saved
 from public.translation_languages l left join public.core_words w on w.status<>'retired'
 left join public.word_translations t on t.lemma=w.lemma and t.language=l.code)
 select c.code,c.enabled,c.priority,count(c.lemma),count(*) filter(where c.lemma is not null and c.saved is not null),
 count(*) filter(where c.lemma is not null and c.saved is null and c.state is null),
 count(*) filter(where c.saved is null and c.state='processing'),count(*) filter(where c.saved is null and c.state='failed'),
 count(*) filter(where c.saved is null and c.state='empty')
 from coverage c group by c.code,c.enabled,c.priority order by c.priority;
end $$;

-- An atomic claim prevents two admin tabs from paying for the same word.
-- A crashed batch stays reserved until explicitly released after ten minutes.
create or replace function public.translation_claim_batch() returns table(lemma text,language text,claim_id uuid)
language plpgsql security definer set search_path=public as $$
declare chosen text; token uuid:=gen_random_uuid();
begin
 perform public.translation_require_admin();
 perform pg_advisory_xact_lock(73124819);
 if exists(select 1 from public.word_translations where state='processing') then return; end if;
 select l.code into chosen from public.translation_languages l
 where l.enabled and exists(select 1 from public.core_words w where w.status<>'retired'
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

create or replace function public.translation_finish(p_claim uuid,p_results jsonb,p_error text default null) returns void
language plpgsql security definer set search_path=public as $$
declare item jsonb;
begin
 perform public.translation_require_admin();
 if p_error is not null then
  update public.word_translations set state='failed',error=left(p_error,500),updated_at=now() where claim_id=p_claim and state='processing';
  return;
 end if;
 for item in select * from jsonb_array_elements(p_results) loop
  update public.word_translations set text=nullif(btrim(item->>'text'),''),
   state=case when nullif(btrim(item->>'text'),'') is null then 'empty' else 'complete' end,error=null,updated_at=now()
  where claim_id=p_claim and lemma=item->>'lemma' and state='processing';
 end loop;
end $$;

create or replace function public.translation_retry(p_language text) returns void
language plpgsql security definer set search_path=public as $$
begin
 perform public.translation_require_admin();
 delete from public.word_translations where language=p_language and
 (state='failed' or (state='processing' and updated_at<now()-interval '10 minutes'));
end $$;

revoke all on function public.translation_require_admin(),public.translation_set_language(text,boolean),public.translation_coverage(),public.translation_claim_batch(),public.translation_finish(uuid,jsonb,text),public.translation_retry(text) from public;
grant execute on function public.translation_set_language(text,boolean),public.translation_coverage(),public.translation_claim_batch(),public.translation_finish(uuid,jsonb,text),public.translation_retry(text) to authenticated;
commit;
