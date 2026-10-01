-- English Mastery — student learning: spaced review, daily activity, goals, staff-managed word list.
-- Run in the hosted Supabase SQL editor as a project owner, after the earlier migrations.

-- Admin staff (not only Super Admin) manage the Core Vocabulary list.
drop policy if exists core_words_student_read on public.core_words;
create policy core_words_student_read on public.core_words
  for select to authenticated
  using (status = 'published' or public.is_admin_staff());

drop policy if exists core_words_admin_write on public.core_words;
create policy core_words_admin_write on public.core_words
  for all to authenticated
  using (public.is_admin_staff())
  with check (public.is_admin_staff());

grant select, insert, update, delete on public.core_words to authenticated;

-- list_order is the time a word was added; words added in one batch share it.
drop index if exists public.core_words_bucket_order_uidx;
create index if not exists core_words_bucket_order_idx on public.core_words (bucket, list_order);

-- Learner settings.
alter table public.profiles add column if not exists daily_goal int not null default 10;
alter table public.profiles add column if not exists learning_bucket text not null default 'beginner';
alter table public.profiles drop constraint if exists profiles_daily_goal_check;
alter table public.profiles add constraint profiles_daily_goal_check check (daily_goal between 3 and 50);
alter table public.profiles drop constraint if exists profiles_learning_bucket_check;
alter table public.profiles
  add constraint profiles_learning_bucket_check
  check (learning_bucket in ('beginner', 'intermediate', 'advanced'));

-- Spaced review (Leitner boxes 1–5; box 4+ counts as mastered).
alter table public.learner_word_progress add column if not exists box smallint not null default 1;
alter table public.learner_word_progress add column if not exists due_at timestamptz not null default now();
alter table public.learner_word_progress add column if not exists seen_count int not null default 1;
alter table public.learner_word_progress add column if not exists correct_count int not null default 0;
alter table public.learner_word_progress add column if not exists wrong_count int not null default 0;
alter table public.learner_word_progress add column if not exists last_seen_at timestamptz not null default now();
alter table public.learner_word_progress drop constraint if exists learner_word_progress_box_check;
alter table public.learner_word_progress
  add constraint learner_word_progress_box_check check (box between 1 and 5);

create index if not exists learner_progress_due_idx
  on public.learner_word_progress (user_id, due_at);

-- One row per learner per day. Written only through bump_learner_activity.
create table if not exists public.learner_daily_activity (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  words_learned int not null default 0,
  reviews int not null default 0,
  correct int not null default 0,
  xp int not null default 0,
  primary key (user_id, day)
);

alter table public.learner_daily_activity enable row level security;

drop policy if exists activity_own_read on public.learner_daily_activity;
create policy activity_own_read on public.learner_daily_activity
  for select to authenticated
  using (user_id = auth.uid() or public.is_super_admin());

grant select on public.learner_daily_activity to authenticated;

create or replace function public.bump_learner_activity(
  p_day date,
  p_learned int,
  p_reviews int,
  p_correct int,
  p_xp int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  if p_day not between current_date - 1 and current_date + 1 then
    raise exception 'Invalid day';
  end if;
  if p_learned < -100 or p_learned > 100 or p_reviews < 0 or p_reviews > 200
     or p_correct < 0 or p_correct > p_reviews or p_xp < 0 or p_xp > 3000 then
    raise exception 'Invalid activity';
  end if;

  insert into public.learner_daily_activity (user_id, day, words_learned, reviews, correct, xp)
  values (auth.uid(), p_day, greatest(p_learned, 0), p_reviews, p_correct, p_xp)
  on conflict (user_id, day) do update
  set words_learned = greatest(0, learner_daily_activity.words_learned + p_learned),
      reviews = learner_daily_activity.reviews + excluded.reviews,
      correct = learner_daily_activity.correct + excluded.correct,
      xp = learner_daily_activity.xp + excluded.xp;
end;
$$;

revoke all on function public.bump_learner_activity(date, int, int, int, int) from public;
grant execute on function public.bump_learner_activity(date, int, int, int, int) to authenticated;
