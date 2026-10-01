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
