-- Speech-check usage for Super Admin.
-- Each speaking check records when it started, when it finished, and how much audio it sent.
-- Run this once in the Supabase SQL editor.

create table if not exists public.em_speech_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  model text not null,
  provider text not null default 'groq',
  status text not null default 'running',
  audio_bytes integer not null default 0,
  audio_ms integer not null default 0,
  latency_ms integer,
  level_key text not null default 'beginner',
  matched integer,
  keyword_total integer,
  http_status integer,
  constraint em_speech_usage_status_check check (status in ('running', 'ok', 'silent', 'error', 'capped', 'rate_limited')),
  constraint em_speech_usage_bytes_check check (audio_bytes between 0 and 5000000),
  constraint em_speech_usage_ms_check check (audio_ms between 0 and 120000),
  constraint em_speech_usage_model_check check (char_length(model) between 1 and 80),
  constraint em_speech_usage_provider_check check (provider in ('groq'))
);

create index if not exists em_speech_usage_started_idx on public.em_speech_usage (started_at desc);
create index if not exists em_speech_usage_user_idx on public.em_speech_usage (user_id, started_at desc);

alter table public.em_speech_usage enable row level security;
revoke all on public.em_speech_usage from public, anon, authenticated;

create or replace function public.begin_speech_check(
  p_model text,
  p_bytes integer,
  p_audio_ms integer,
  p_level text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  row_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;
  insert into public.em_speech_usage (user_id, model, provider, status, audio_bytes, audio_ms, level_key)
  values (
    auth.uid(),
    left(coalesce(nullif(btrim(p_model), ''), 'whisper-large-v3'), 80),
    'groq',
    'running',
    least(greatest(coalesce(p_bytes, 0), 0), 5000000),
    least(greatest(coalesce(p_audio_ms, 0), 0), 120000),
    case when p_level in ('beginner', 'intermediate', 'advanced') then p_level else 'beginner' end
  )
  returning id into row_id;
  return row_id;
end;
$$;

create or replace function public.finish_speech_check(
  p_id uuid,
  p_status text,
  p_latency_ms integer,
  p_matched integer,
  p_total integer,
  p_http integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or p_id is null then
    return;
  end if;
  update public.em_speech_usage
  set finished_at = now(),
      status = case
        when p_status in ('ok', 'silent', 'error', 'capped', 'rate_limited') then p_status
        else 'error'
      end,
      latency_ms = least(greatest(coalesce(p_latency_ms, 0), 0), 120000),
      matched = case when p_matched is null then null else least(greatest(p_matched, 0), 20) end,
      keyword_total = case when p_total is null then null else least(greatest(p_total, 0), 20) end,
      http_status = case when p_http is null then null else least(greatest(p_http, 0), 599) end
  where id = p_id
    and user_id = auth.uid()
    and status = 'running';
end;
$$;

create or replace function public.speech_usage_rows(p_since timestamptz)
returns table (
  id uuid,
  user_id uuid,
  student_name text,
  email text,
  school text,
  class_label text,
  started_at timestamptz,
  finished_at timestamptz,
  model text,
  provider text,
  status text,
  audio_bytes integer,
  audio_ms integer,
  latency_ms integer,
  level_key text,
  matched integer,
  keyword_total integer,
  http_status integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
      and profiles.is_active is distinct from false
  ) then
    raise exception 'Super Admin required';
  end if;
  return query
  select
    u.id,
    u.user_id,
    coalesce(nullif(btrim(coalesce(p.nickname, p.display_name)), ''), 'Student')::text,
    coalesce(p.email, '')::text,
    coalesce(l.name, '')::text,
    coalesce(nullif(btrim(concat_ws(' ', r.standard_label, r.section_label)), ''), '')::text,
    u.started_at,
    u.finished_at,
    u.model,
    u.provider,
    u.status,
    u.audio_bytes,
    u.audio_ms,
    u.latency_ms,
    u.level_key,
    u.matched,
    u.keyword_total,
    u.http_status
  from public.em_speech_usage u
  left join public.profiles p on p.id = u.user_id
  left join lateral (
    select roster.standard_label, roster.section_label, roster.licence_id
    from public.em_roster roster
    where roster.user_id = u.user_id
    order by roster.created_at desc
    limit 1
  ) r on true
  left join public.em_licences l on l.id = r.licence_id
  where u.started_at >= coalesce(p_since, now() - interval '31 days')
  order by u.started_at desc
  limit 8000;
end;
$$;

revoke all on function public.begin_speech_check(text, integer, integer, text) from public;
revoke all on function public.finish_speech_check(uuid, text, integer, integer, integer, integer) from public;
revoke all on function public.speech_usage_rows(timestamptz) from public;
grant execute on function public.begin_speech_check(text, integer, integer, text) to authenticated;
grant execute on function public.finish_speech_check(uuid, text, integer, integer, integer, integer) to authenticated;
grant execute on function public.speech_usage_rows(timestamptz) to authenticated;
