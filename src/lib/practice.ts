import { containsTarget } from './local-grammar';
import { levelsOf } from './learner-stats';
import type { LearnerData, StudyWord } from './learner';
import { liveBuckets, type LiveBucket } from './vocab';

const PRAISE: Record<LiveBucket, [string, string, string]> = {
  beginner: ['Good', 'Congratulations', 'Kudos'],
  intermediate: ['Good', 'Fabulous', 'You are rocking'],
  advanced: ['Fabulous', 'You are rocking', 'Brilliant'],
};

/** Milder lines for beginner words. Stronger lines when more of the round is already correct. */
export function praiseLine(bucket: LiveBucket, correct: number, total: number) {
  const rate = total > 0 ? correct / total : 0;
  const step = rate >= 0.75 ? 2 : rate >= 0.4 ? 1 : 0;
  return PRAISE[bucket][step];
}

export const PRACTICE_TOTAL = 10;

/** A sentence must open with a capital. A full stop is required for a story, not for one practice sentence. */
export function sentenceFrame(text: string) {
  const clean = text.trim();
  return { capital: /^[A-Z]/.test(clean), stop: /\.$/.test(clean) };
}

export function passageUsesFullStops(text: string) {
  const clean = text.trim();
  if (!clean.endsWith('.')) return false;
  return !/[a-z0-9]["')\]]?\s+[A-Z]/.test(clean);
}

export function withSentenceFrame(text: string) {
  let next = text.trim();
  if (!next) return next;
  if (!/^[A-Z]/.test(next)) next = next.charAt(0).toUpperCase() + next.slice(1);
  if (!/\.$/.test(next)) next = next.replace(/[.?!]+$/, '') + '.';
  return next;
}

function sameWithoutStop(text: string, correction: string) {
  const core = (value: string) => value.trim().replace(/[.?!]+$/g, '').replace(/\s+/g, ' ').toLowerCase();
  return core(text) === core(correction);
}

export function frameReview(text: string, suggestion: { ok: boolean; corrections: string[]; reason: string }, requireStop = false) {
  const frame = sentenceFrame(text);
  const stopsOk = requireStop ? passageUsesFullStops(text) : true;
  const onlyStop = !suggestion.ok && suggestion.corrections.length > 0 && suggestion.corrections.every((line) => sameWithoutStop(text, line));
  const writingOk = suggestion.ok || (!requireStop && onlyStop);
  const accepted = writingOk && stopsOk;
  const notes = [!frame.capital ? 'Start with a capital letter.' : '', requireStop && !stopsOk ? 'End each sentence with a full stop.' : '', accepted ? '' : suggestion.reason].filter(Boolean);
  const corrections = accepted ? [] : [...new Set((suggestion.corrections.length ? suggestion.corrections : [text]).map(withSentenceFrame))].filter((line) => line !== text.trim()).slice(0, 3);
  return { ok: frame.capital && stopsOk && accepted, corrections, reason: notes.join(' ') };
}

export type PracticeMix = Record<LiveBucket, number>;

export type PracticeNote = { word: string; ok: boolean; teach: string; original?: string; correction?: string; ambiguous?: boolean; message?: string };

export type PracticeMark = {
  score: number;
  max: number;
  summary: string;
  notes: PracticeNote[];
  passageNotes?: PracticeNote[];
};


export function emptyMix(): PracticeMix {
  return { beginner: 0, intermediate: 0, advanced: 0 };
}

export function mixTotal(mix: PracticeMix) {
  return liveBuckets.reduce((sum, bucket) => sum + mix[bucket], 0);
}

function shuffle<T>(list: T[]) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function trackSource(data: LearnerData, bucket: LiveBucket) {
  const levels = levelsOf(data, bucket, data.profile.batchSize);
  const finished = levels.filter((level) => level.state === 'done');
  const learned = finished.flatMap((level) => level.words);
  const all = data.words.filter((word) => word.bucket === bucket);
  return {
    words: learned.length ? learned : all,
    fromFinished: learned.length > 0,
    finishedLevels: finished.length,
    available: learned.length ? learned.length : all.length,
  };
}

export function drawPracticePool(data: LearnerData, mix: PracticeMix) {
  const picked: StudyWord[] = [];
  for (const bucket of liveBuckets) {
    const want = mix[bucket] ?? 0;
    if (!want) continue;
    const source = trackSource(data, bucket).words;
    picked.push(...shuffle(source).slice(0, want));
  }
  return shuffle(picked);
}

const WORD_SUFFIX = /^(s|es|ed|d|ing|er|est|ly|ness|ment|ence)?$/;

/** The vocabulary task: the target, a real form, or a close attempt such as “occuring”. */
export function textUsesWord(text: string, word: string) {
  if (containsTarget(text, word)) return true;
  const base = word.trim().toLowerCase();
  if (base.length < 4 || !/^[a-z]+$/.test(base)) return false;
  const tokens = text.toLowerCase().match(/[a-z]+/g) ?? [];
  return tokens.some((token) => {
    if (!token.startsWith(base)) return false;
    let rest = token.slice(base.length);
    if (rest.startsWith(base[base.length - 1])) rest = rest.slice(1);
    return WORD_SUFFIX.test(rest);
  });
}
