import { countryOf, startOfWeek, weekdayLong, weekdayShort } from './countries';
import { dayKey, type DayActivity, type LearnerData, type StudyWord } from './learner';
import { isDue, isMastered } from './srs';
import { liveBuckets, type LiveBucket } from './vocab';

const DAY = 86_400_000;

export type SessionKind = 'today' | 'learn' | 'review' | 'practice';
export type SessionItem = { kind: 'learn' | 'review'; wordId: string };

export function streakOf(activity: DayActivity[], now = Date.now()) {
  const active = new Set(activity.filter((a) => a.learned + a.reviews > 0).map((a) => a.day));
  let cursor = active.has(dayKey(now)) ? now : now - DAY;
  let streak = 0;
  while (active.has(dayKey(cursor))) {
    streak += 1;
    cursor -= DAY;
  }
  return streak;
}

export function weekOf(activity: DayActivity[], country = 'IN', now = Date.now()) {
  const byDay = new Map(activity.map((a) => [a.day, a]));
  const start = startOfWeek(now, countryOf(country).weekStart);
  const today = dayKey(now);
  return Array.from({ length: 7 }, (_, i) => {
    const time = start + i * DAY;
    const key = dayKey(time);
    const a = byDay.get(key);
    const weekday = new Date(time).getDay();
    return {
      key,
      label: weekdayShort(weekday),
      name: weekdayLong(weekday),
      weekday,
      weekend: weekday === 0 || weekday === 6,
      xp: a?.xp ?? 0,
      active: !!a && a.learned + a.reviews > 0,
      today: key === today,
    };
  });
}

export function todayOf(activity: DayActivity[], now = Date.now()) {
  const key = dayKey(now);
  return activity.find((a) => a.day === key) ?? { day: key, learned: 0, reviews: 0, correct: 0, xp: 0 };
}

/** Words with a saved learn record from today. Skipped cards never count. */
export function learnedToday(data: LearnerData, now = Date.now(), bucket?: LiveBucket) {
  const key = dayKey(now);
  return data.words.filter((word) => {
    if (bucket && word.bucket !== bucket) return false;
    const progress = data.progress[word.id];
    return !!progress && dayKey(progress.learnedAt) === key;
  }).length;
}

export type LevelState = 'done' | 'current' | 'locked';
export type WordLevel = { number: number; words: StudyWord[]; learned: number; state: LevelState };

/**
 * Slices a track's current word list into levels of `size` words. Progress belongs to words, not levels,
 * so adding words or changing the size rebuilds the path without losing anything already learned.
 */
export function levelsOf(data: LearnerData, bucket: LiveBucket, size: number): WordLevel[] {
  const list = data.words.filter((w) => w.bucket === bucket);
  const levels: WordLevel[] = [];
  let hasCurrent = false;
  for (let i = 0; i < list.length; i += size) {
    const words = list.slice(i, i + size);
    const learned = words.filter((w) => data.progress[w.id]).length;
    let state: LevelState = 'done';
    if (learned < words.length) {
      state = hasCurrent ? 'locked' : 'current';
      hasCurrent = true;
    }
    levels.push({ number: levels.length + 1, words, learned, state });
  }
  return levels;
}

export function trackSummary(data: LearnerData, bucket: LiveBucket, size: number) {
  const levels = levelsOf(data, bucket, size);
  let total = 0;
  let learned = 0;
  let mastered = 0;
  let correct = 0;
  let answered = 0;
  for (const level of levels) {
    for (const w of level.words) {
      const p = data.progress[w.id];
      total += 1;
      if (!p) continue;
      learned += 1;
      if (isMastered(p)) mastered += 1;
      correct += p.correct;
      answered += p.correct + p.wrong;
    }
  }
  return {
    bucket,
    levels,
    total,
    learned,
    mastered,
    done: levels.filter((l) => l.state === 'done').length,
    current: levels.find((l) => l.state === 'current') ?? null,
    complete: total > 0 && learned === total,
    percent: total ? Math.floor((learned / total) * 100) : 0,
    score: answered ? Math.round((correct / answered) * 100) : null,
    due: data.words.filter((w) => w.bucket === bucket && isDue(data.progress[w.id])).length,
  };
}

export type TrackSummary = ReturnType<typeof trackSummary>;

export function trackSummaries(data: LearnerData) {
  return liveBuckets.map((b) => trackSummary(data, b, data.profile.batchSize));
}

export function dueWords(data: LearnerData, now = Date.now()) {
  return data.words
    .filter((w) => isDue(data.progress[w.id], now))
    .sort((a, b) => data.progress[a.id].dueAt - data.progress[b.id].dueAt);
}

/** Unseen words in the learner's track first, then the following levels. */
export function newWords(data: LearnerData, track: LiveBucket) {
  const start = liveBuckets.indexOf(track);
  const order = [...liveBuckets.slice(start), ...liveBuckets.slice(0, start)];
  return order.flatMap((bucket) => data.words.filter((w) => w.bucket === bucket && !data.progress[w.id]));
}

export function wordOfDay(data: LearnerData, track: LiveBucket, now = Date.now()) {
  const pool = data.words.filter((w) => w.bucket === track);
  const list = pool.length ? pool : data.words;
  if (!list.length) return null;
  let hash = 0;
  for (const ch of dayKey(now)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return list[hash % list.length];
}

function shuffle<T>(list: T[]) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const review = (list: StudyWord[]) => list.map((w) => ({ kind: 'review' as const, wordId: w.id }));
const learn = (list: StudyWord[]) => list.map((w) => ({ kind: 'learn' as const, wordId: w.id }));

/** Continue unfinished levels with new words; completed levels replay as a quiz. */
export function levelSession(data: LearnerData, level: WordLevel, now = Date.now()): SessionItem[] {
  const due = level.words.filter((w) => isDue(data.progress[w.id], now)).slice(0, 10);
  const fresh = level.words.filter((w) => !data.progress[w.id]).slice(0, 10);
  if (fresh.length) return learn(fresh);
  return review(due.length ? due : shuffle(level.words).slice(0, 10));
}

export function buildSession(kind: SessionKind, data: LearnerData, bucket?: LiveBucket, now = Date.now()): SessionItem[] {
  const track = data.profile.track;
  const inScope = (w: StudyWord) => !bucket || w.bucket === bucket;
  const due = dueWords(data, now).filter(inScope);
  const fresh = newWords(data, track).filter(inScope);

  if (kind === 'learn') return learn(fresh.slice(0, 5));
  if (kind === 'review') return review(due.slice(0, 15));
  if (kind === 'practice') {
    const seen = data.words.filter((w) => inScope(w) && data.progress[w.id]);
    return review(shuffle(seen).slice(0, 10));
  }

  const remaining = Math.max(0, data.profile.dailyGoal - learnedToday(data, now));
  const reviews = review(due.slice(0, 10));
  const news = learn(fresh.slice(0, Math.min(10, remaining || (reviews.length ? 0 : 5))));
  return [...reviews, ...news];
}

/** Words whose meanings can serve as wrong answers: same level first, then the learner's other words. */
export function distractorPool(items: SessionItem[], data: LearnerData, size = 16) {
  const inSession = new Set(items.map((i) => i.wordId));
  const buckets = new Set(data.words.filter((w) => inSession.has(w.id)).map((w) => w.bucket));
  const seen = shuffle(data.words.filter((w) => !inSession.has(w.id) && data.progress[w.id]));
  const level = shuffle(data.words.filter((w) => !inSession.has(w.id) && !data.progress[w.id] && buckets.has(w.bucket)));
  return [...seen, ...level].slice(0, size);
}

/** The right meaning plus three wrong ones: stored distractors first, then other words' meanings. */
export function quizOptions(word: StudyWord, pool: StudyWord[], meaningOf: (w: StudyWord) => string | null) {
  const right = meaningOf(word);
  if (!right) return null;
  const wrong = new Set<string>();
  for (const d of shuffle(word.distractors)) {
    if (d !== right) wrong.add(d);
    if (wrong.size === 3) break;
  }
  for (const w of shuffle(pool)) {
    if (wrong.size === 3) break;
    const m = w.id === word.id ? null : meaningOf(w);
    if (m && m !== right) wrong.add(m);
  }
  if (wrong.size < 3) return null;
  return { right, options: shuffle([right, ...wrong]) };
}
