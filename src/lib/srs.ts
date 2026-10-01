export type WordProgress = {
  wordId: string;
  box: number;
  dueAt: number;
  learnedAt: number;
  lastSeenAt: number;
  seen: number;
  correct: number;
  wrong: number;
};

const DAY = 86_400_000;
const RETRY_MS = 10 * 60_000;
/** Days until the next review, by Leitner box. */
const INTERVAL_DAYS: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

export const XP = { learn: 10, correct: 5, wrong: 1 } as const;

export function learnedNow(wordId: string, now = Date.now()): WordProgress {
  return { wordId, box: 1, dueAt: now + DAY, learnedAt: now, lastSeenAt: now, seen: 1, correct: 0, wrong: 0 };
}

export function reviewed(p: WordProgress, correct: boolean, now = Date.now()): WordProgress {
  if (!correct) {
    return { ...p, box: 1, dueAt: now + RETRY_MS, lastSeenAt: now, seen: p.seen + 1, wrong: p.wrong + 1 };
  }
  const box = Math.min(5, p.box + 1);
  return { ...p, box, dueAt: now + INTERVAL_DAYS[box] * DAY, lastSeenAt: now, seen: p.seen + 1, correct: p.correct + 1 };
}

export function isMastered(p: WordProgress | undefined) {
  return !!p && p.box >= 4;
}

export function isDue(p: WordProgress | undefined, now = Date.now()) {
  return !!p && p.dueAt <= now;
}
