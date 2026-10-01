import type { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserSupabase } from './supabase';
import type { WordProgress } from './srs';
import { asHiFont, asTaFont, type HiFont, type TaFont } from './script-font';
import { asCountry, DEFAULT_COUNTRY, type CountryId } from './countries';
import { clearEntryCache } from './entry-cache';
import { clearLiveCache, readLiveCache, writeLiveCache } from './learner-cache';
import { asThesaurus, type ThesaurusId } from './thesaurus';
import { canAddCoreWords, isAdminStaff, isStaff, isSuperAdmin } from './access';
import { loadRoleGrants } from './grants';
import type { LiveBucket } from './vocab';
import { parseOverrides, type WordOverrides } from './word-overrides';
import { words as sampleWords } from './words';

export type Language = 'en' | 'ta' | 'hi' | 'ml' | 'te' | 'kn' | 'fr';

export type StudyWord = {
  id: string;
  word: string;
  lemma: string;
  bucket: LiveBucket;
  pos: string | null;
  meaning: string | null;
  ta: string | null;
  hi: string | null;
  synonym: string | null;
  antonym: string | null;
  examples: string[];
  distractors: string[];
  overrides: WordOverrides;
};

export type DayActivity = { day: string; learned: number; reviews: number; correct: number; xp: number };

export type LearnerProfile = {
  name: string;
  language: Language;
  dailyGoal: number;
  track: LiveBucket;
  batchSize: number;
  taFont: TaFont;
  hiFont: HiFont;
  thesaurus: ThesaurusId;
  country: CountryId;
  localCache: boolean;
};

export const BATCH_SIZES = [10, 20, 25, 50, 75, 100];
const DEFAULT_BATCH = 50;

export type LearnerData = {
  mode: 'live' | 'sample';
  userId: string | null;
  profile: LearnerProfile;
  words: StudyWord[];
  progress: Record<string, WordProgress>;
  activity: DayActivity[];
  fromCache?: boolean;
  /** Staff signed in (not a student) can add a looked-up word to the published list. */
  canAddWords?: boolean;
  /** Signed-in staff can open the admin panel from the account badge. */
  staff?: boolean;
};

export type ActivityDelta = { learned: number; reviews: number; correct: number; xp: number };

const PAGE = 1000;
const LOCAL_KEY = 'em-learner-v2';
const LANGS: Language[] = ['en', 'ta', 'hi', 'ml', 'te', 'kn', 'fr'];
const TRACKS: LiveBucket[] = ['beginner', 'intermediate', 'advanced'];

export function dayKey(time = Date.now()) {
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function asLanguage(value: unknown): Language {
  return LANGS.includes(value as Language) ? (value as Language) : 'en';
}

function asTrack(value: unknown): LiveBucket {
  return TRACKS.includes(value as LiveBucket) ? (value as LiveBucket) : 'beginner';
}

function asGoal(value: unknown) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 3 && n <= 50 ? n : 10;
}

function asBatch(value: unknown) {
  const n = Number(value);
  return BATCH_SIZES.includes(n) ? n : DEFAULT_BATCH;
}

function asFlag(value: unknown, fallback = true) {
  return typeof value === 'boolean' ? value : fallback;
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && !!v.trim()) : [];
}

function sampleStudyWords(): StudyWord[] {
  return sampleWords.map((w, i) => ({
    id: `sample-${i}`,
    word: w.word,
    lemma: w.word.toLowerCase(),
    bucket: 'intermediate',
    pos: w.type,
    meaning: w.meaning,
    ta: w.ta,
    hi: w.hi,
    synonym: w.synonym,
    antonym: w.antonym,
    examples: w.examples,
    distractors: w.options.slice(1),
    overrides: {},
  }));
}

async function pages<T>(query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await query(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

type LocalState = {
  profile?: Partial<LearnerProfile> & { scriptFont?: string };
  progress?: Record<string, WordProgress>;
  activity?: DayActivity[];
};

function localKey(userId: string | null) {
  return `${LOCAL_KEY}:${userId ?? 'guest'}`;
}

function readLocal(userId: string | null): LocalState {
  try {
    return JSON.parse(localStorage.getItem(localKey(userId)) || '{}') as LocalState;
  } catch {
    return {};
  }
}

function writeLocal(userId: string | null, state: LocalState) {
  try {
    localStorage.setItem(localKey(userId), JSON.stringify(state));
  } catch {
    /* Private mode or full storage: progress lasts for this visit only. */
  }
}

type ProfileRow = {
  display_name: string | null;
  nickname: string | null;
  mother_tongue: string | null;
  daily_goal?: number | null;
  learning_bucket?: string | null;
  batch_size?: number | null;
  country?: string | null;
  local_cache?: boolean | null;
  role?: string | null;
};

async function readProfile(sb: SupabaseClient, userId: string) {
  // `*` keeps working whichever optional columns the database has migrated so far.
  const { data } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
  return (data as ProfileRow | null) ?? null;
}

type WordRow = {
  id: string;
  lemma: string;
  display_word: string;
  bucket: LiveBucket;
  part_of_speech: string | null;
  meaning: string | null;
  meaning_ta: string | null;
  meaning_hi: string | null;
  auto_ta?: string | null;
  auto_hi?: string | null;
  synonym: string | null;
  antonym: string | null;
  examples: unknown;
  distractors: unknown;
  overrides?: unknown;
};

const WORD_COLUMNS =
  'id, lemma, display_word, bucket, part_of_speech, meaning, meaning_ta, meaning_hi, synonym, antonym, examples, distractors';

async function readWords(sb: SupabaseClient) {
  const query = (columns: string) =>
    pages<WordRow>((from, to) =>
      sb.from('core_words').select(columns).eq('status', 'published').order('bucket').order('list_order').order('lemma').range(from, to) as unknown as PromiseLike<{
        data: WordRow[] | null;
        error: { message: string } | null;
      }>,
    );
  try {
    return await query(`${WORD_COLUMNS}, overrides, auto_ta, auto_hi`);
  } catch {
    return query(WORD_COLUMNS);
  }
}

type ProgressRow = {
  word_id: string;
  box: number;
  due_at: string;
  completed_at: string;
  last_seen_at: string;
  seen_count: number;
  correct_count: number;
  wrong_count: number;
};

type ActivityRow = { day: string; words_learned: number; reviews: number; correct: number; xp: number };

async function readLive(sb: SupabaseClient, userId: string) {
  const [wordRows, progressRows, activityRows] = await Promise.all([
    readWords(sb),
    pages<ProgressRow>((from, to) =>
      sb
        .from('learner_word_progress')
        .select('word_id, box, due_at, completed_at, last_seen_at, seen_count, correct_count, wrong_count')
        .eq('user_id', userId)
        .range(from, to),
    ),
    pages<ActivityRow>((from, to) =>
      sb.from('learner_daily_activity').select('day, words_learned, reviews, correct, xp').eq('user_id', userId).range(from, to),
    ),
  ]);

  const words: StudyWord[] = wordRows.map((r) => ({
    id: r.id,
    word: r.display_word,
    lemma: r.lemma,
    bucket: r.bucket,
    pos: r.part_of_speech,
    meaning: r.meaning,
    ta: r.meaning_ta || r.auto_ta || null,
    hi: r.meaning_hi || r.auto_hi || null,
    synonym: r.synonym,
    antonym: r.antonym,
    examples: strings(r.examples),
    distractors: strings(r.distractors),
    overrides: parseOverrides(r.overrides),
  }));
  const progress: Record<string, WordProgress> = {};
  for (const r of progressRows) {
    progress[r.word_id] = {
      wordId: r.word_id,
      box: r.box,
      dueAt: Date.parse(r.due_at),
      learnedAt: Date.parse(r.completed_at),
      lastSeenAt: Date.parse(r.last_seen_at),
      seen: r.seen_count,
      correct: r.correct_count,
      wrong: r.wrong_count,
    };
  }
  const activity: DayActivity[] = activityRows.map((r) => ({
    day: r.day,
    learned: r.words_learned,
    reviews: r.reviews,
    correct: r.correct,
    xp: r.xp,
  }));
  return { words, progress, activity };
}

export async function loadLearner(opts?: { skipCache?: boolean }): Promise<LearnerData> {
  let sb: SupabaseClient | null = null;
  let userId: string | null = null;
  let row: ProfileRow | null = null;
  try {
    sb = createBrowserSupabase();
    userId = (await sb.auth.getUser()).data.user?.id ?? null;
    if (userId) row = await readProfile(sb, userId);
  } catch {
    sb = null;
  }

  const stored = readLocal(userId).profile;
  const profile: LearnerProfile = {
    name: row?.nickname || row?.display_name || 'Learner',
    language: asLanguage(row?.mother_tongue),
    dailyGoal: asGoal(row?.daily_goal),
    track: asTrack(row?.learning_bucket),
    batchSize: asBatch(row?.batch_size ?? stored?.batchSize),
    taFont: asTaFont(stored?.taFont, stored?.scriptFont),
    hiFont: asHiFont(stored?.hiFont, stored?.scriptFont),
    thesaurus: asThesaurus(stored?.thesaurus),
    country: asCountry(row?.country ?? stored?.country ?? DEFAULT_COUNTRY),
    localCache: asFlag(row?.local_cache ?? stored?.localCache, true),
  };
  const grants =
    sb && row?.role && isAdminStaff(row.role) && !isSuperAdmin(row.role) ? await loadRoleGrants(sb, row.role) : {};
  const canAddWords = canAddCoreWords(row?.role, grants);
  const staff = isStaff(row?.role);

  if (sb && userId) {
    if (profile.localCache && !opts?.skipCache) {
      const cached = await readLiveCache(userId);
      if (cached) return { mode: 'live', userId, profile, ...cached, fromCache: true, canAddWords, staff };
    }
    try {
      const live = await readLive(sb, userId);
      if (live.words.length) {
        if (profile.localCache) void writeLiveCache(userId, live);
        return { mode: 'live', userId, profile, ...live, canAddWords, staff };
      }
    } catch {
      const cached = profile.localCache ? await readLiveCache(userId) : null;
      if (cached) return { mode: 'live', userId, profile, ...cached, fromCache: true, canAddWords, staff };
    }
  }

  const local = readLocal(userId);
  return {
    mode: 'sample',
    userId,
    profile: {
      name: local.profile?.name || profile.name,
      language: asLanguage(local.profile?.language ?? profile.language),
      dailyGoal: asGoal(local.profile?.dailyGoal ?? profile.dailyGoal),
      track: 'intermediate',
      batchSize: asBatch(local.profile?.batchSize ?? profile.batchSize),
      taFont: asTaFont(local.profile?.taFont ?? profile.taFont, local.profile?.scriptFont),
      hiFont: asHiFont(local.profile?.hiFont ?? profile.hiFont, local.profile?.scriptFont),
      thesaurus: asThesaurus(local.profile?.thesaurus ?? profile.thesaurus),
      country: asCountry(local.profile?.country ?? profile.country),
      localCache: asFlag(local.profile?.localCache ?? profile.localCache, true),
    },
    words: sampleStudyWords(),
    progress: local.progress ?? {},
    activity: Array.isArray(local.activity) ? local.activity : [],
    canAddWords,
    staff,
  };
}

export function applyDelta(activity: DayActivity[], day: string, delta: ActivityDelta) {
  const found = activity.find((a) => a.day === day);
  if (!found) return [...activity, { day, ...delta }];
  return activity.map((a) =>
    a.day === day
      ? {
          ...a,
          learned: a.learned + delta.learned,
          reviews: a.reviews + delta.reviews,
          correct: a.correct + delta.correct,
          xp: a.xp + delta.xp,
        }
      : a,
  );
}

/** Drop today's new-word count back to the words that still have a learn record. */
export function clampTodayLearned(activity: DayActivity[], learned: number, now = Date.now()) {
  const day = dayKey(now);
  const today = activity.find((entry) => entry.day === day);
  if (!today || today.learned <= learned) return activity;
  return activity.map((entry) => (entry.day === day ? { ...entry, learned } : entry));
}

/** Persist a day-activity bump that is not tied to a vocabulary card (grammar lessons, for example). */
export async function recordActivity(data: LearnerData, delta: ActivityDelta, day: string) {
  if (data.mode === 'sample' || !data.userId) {
    const local = readLocal(data.userId);
    writeLocal(data.userId, {
      ...local,
      activity: applyDelta(Array.isArray(local.activity) ? local.activity : [], day, delta),
    });
    return;
  }
  const sb = createBrowserSupabase();
  const bumped = await sb.rpc('bump_learner_activity', {
    p_day: day,
    p_learned: delta.learned,
    p_reviews: delta.reviews,
    p_correct: delta.correct,
    p_xp: delta.xp,
  });
  if (bumped.error) throw new Error(bumped.error.message);
  if (data.profile.localCache) {
    void writeLiveCache(data.userId, {
      words: data.words,
      progress: data.progress,
      activity: applyDelta(data.activity, day, delta),
    });
  }
}

/** Persist one answered item. Local state is updated by the caller first; this only writes it through. */
export async function recordItem(data: LearnerData, progress: WordProgress, delta: ActivityDelta, day: string) {
  if (data.mode === 'sample') {
    const local = readLocal(data.userId);
    writeLocal(data.userId, {
      ...local,
      progress: { ...(local.progress ?? {}), [progress.wordId]: progress },
      activity: applyDelta(Array.isArray(local.activity) ? local.activity : [], day, delta),
    });
    return;
  }
  const sb = createBrowserSupabase();
  const [saved, bumped] = await Promise.all([
    sb.from('learner_word_progress').upsert(
      {
        user_id: data.userId,
        word_id: progress.wordId,
        box: progress.box,
        due_at: new Date(progress.dueAt).toISOString(),
        completed_at: new Date(progress.learnedAt).toISOString(),
        last_seen_at: new Date(progress.lastSeenAt).toISOString(),
        seen_count: progress.seen,
        correct_count: progress.correct,
        wrong_count: progress.wrong,
      },
      { onConflict: 'user_id,word_id' },
    ),
    sb.rpc('bump_learner_activity', {
      p_day: day,
      p_learned: delta.learned,
      p_reviews: delta.reviews,
      p_correct: delta.correct,
      p_xp: delta.xp,
    }),
  ]);
  const error = saved.error || bumped.error;
  if (error) throw new Error(error.message);
  if (data.userId && data.profile.localCache) {
    const activity = applyDelta(data.activity, day, delta);
    void writeLiveCache(data.userId, {
      words: data.words,
      progress: { ...data.progress, [progress.wordId]: progress },
      activity,
    });
  }
}

export type ResetScope = 'level' | 'track';

export async function resetProgress(data: LearnerData, wordIds: string[]) {
  const unique = [...new Set(wordIds)];
  const progress = { ...data.progress };
  for (const id of unique) delete progress[id];

  if (data.mode === 'sample' || !data.userId) {
    const local = readLocal(data.userId);
    const next = { ...(local.progress ?? {}) };
    for (const id of unique) delete next[id];
    writeLocal(data.userId, { ...local, progress: next });
    return progress;
  }

  const sb = createBrowserSupabase();
  const chunk = 200;
  for (let i = 0; i < unique.length; i += chunk) {
    const slice = unique.slice(i, i + chunk);
    const { error } = await sb.from('learner_word_progress').delete().eq('user_id', data.userId).in('word_id', slice);
    if (error) throw new Error(error.message);
  }
  if (data.profile.localCache) void writeLiveCache(data.userId, { words: data.words, progress, activity: data.activity });
  return progress;
}

export async function saveProfile(data: LearnerData, profile: LearnerProfile) {
  const local = readLocal(data.userId);
  writeLocal(data.userId, { ...local, profile });
  if (!profile.localCache) {
    void clearLiveCache(data.userId);
    void clearEntryCache(data.userId);
  }
  else if (data.userId && data.words.length) {
    void writeLiveCache(data.userId, { words: data.words, progress: data.progress, activity: data.activity });
  }
  if (data.mode === 'sample' || !data.userId) return;
  const sb = createBrowserSupabase();
  const fields = {
    display_name: profile.name,
    nickname: profile.name,
    mother_tongue: profile.language,
    daily_goal: profile.dailyGoal,
    learning_bucket: profile.track,
    country: profile.country,
    batch_size: profile.batchSize,
    local_cache: profile.localCache !== false,
  };
  let { error } = await sb.from('profiles').update(fields).eq('id', data.userId);
  if (error && /local_cache|batch_size|country/.test(error.message)) {
    // Optional-column migrations may not be run yet: keep those choices on this browser.
    const { local_cache: _cache, ...withoutCache } = fields;
    ({ error } = await sb.from('profiles').update(withoutCache).eq('id', data.userId));
    if (error && /batch_size|country/.test(error.message)) {
      const { country: _country, ...withoutCountry } = withoutCache;
      ({ error } = await sb.from('profiles').update(withoutCountry).eq('id', data.userId));
      if (error && /batch_size/.test(error.message)) {
        const { batch_size: _batch, ...core } = withoutCountry;
        ({ error } = await sb.from('profiles').update(core).eq('id', data.userId));
      }
    }
  }
  if (error) throw new Error(error.message);
}
