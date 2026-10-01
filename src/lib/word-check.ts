import { lemmaOf, displayWord } from './vocab';
import {
  ADVANCED_LIST,
  BEGINNER_LIST,
  INTERMEDIATE_LIST,
} from './classify-lists';

export type WordIssue = {
  word: string;
  suggestions: string[];
};

export type WordCheckResult = {
  accepted: string[];
  corrected: { from: string; to: string }[];
  rejected: WordIssue[];
};

const KNOWN = new Set<string>([...BEGINNER_LIST, ...INTERMEDIATE_LIST, ...ADVANCED_LIST]);

/** a / i are valid English headwords; everything else needs length ≥ 2. */
function isPlausibleShape(lemma: string) {
  if (!lemma) return false;
  if (lemma === 'a' || lemma === 'i') return true;
  if (lemma.length < 2 || lemma.length > 32) return false;
  if (!/^[a-z]+(?:'[a-z]+)?(?:-[a-z]+)*$/.test(lemma)) return false;
  // Reject vowel-less mash (except short acronyms we don't want anyway)
  if (lemma.length >= 4 && !/[aeiouy]/.test(lemma)) return false;
  return true;
}

function editDistance(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i += 1) {
    let prev = i;
    row[0] = i + 1;
    for (let j = 0; j < b.length; j += 1) {
      const next = row[j + 1];
      const cost = a[i] === b[j] ? 0 : 1;
      row[j + 1] = Math.min(row[j + 1] + 1, row[j] + 1, prev + cost);
      prev = next;
    }
  }
  return row[b.length];
}

async function dictionaryLookup(lemma: string): Promise<'yes' | 'no' | 'unknown'> {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(lemma)}`,
      { signal: AbortSignal.timeout(6000) },
    );
    if (res.ok) return 'yes';
    if (res.status === 404) return 'no';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

async function spellingSuggestions(lemma: string) {
  try {
    const res = await fetch(
      `https://api.datamuse.com/sug?s=${encodeURIComponent(lemma)}&max=5`,
      { signal: AbortSignal.timeout(6000) },
    );
    if (!res.ok) return [] as string[];
    const data = (await res.json()) as { word?: string }[];
    return data
      .map((row) => lemmaOf(row.word || ''))
      .filter((w) => w && w !== lemma)
      .slice(0, 5);
  } catch {
    return [] as string[];
  }
}

export async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next;
      next += 1;
      out[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

/**
 * Validate pasted headwords: shape → known lists → Free Dictionary → Datamuse spelling tips.
 * Clear single-edit typos are auto-corrected; the rest are rejected with suggestions.
 */
export async function checkEnglishWords(rawWords: string[]): Promise<WordCheckResult> {
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const raw of rawWords) {
    const word = displayWord(raw);
    const lemma = lemmaOf(word);
    if (!lemma || seen.has(lemma)) continue;
    seen.add(lemma);
    unique.push(word);
  }

  const accepted: string[] = [];
  const corrected: { from: string; to: string }[] = [];
  const rejected: WordIssue[] = [];
  const needsLookup: string[] = [];

  for (const word of unique) {
    const lemma = lemmaOf(word);
    if (!isPlausibleShape(lemma)) {
      rejected.push({ word, suggestions: [] });
      continue;
    }
    if (KNOWN.has(lemma)) {
      accepted.push(word);
      continue;
    }
    needsLookup.push(word);
  }

  const lookups = await mapPool(needsLookup, 6, async (word) => {
    const lemma = lemmaOf(word);
    const status = await dictionaryLookup(lemma);
    if (status === 'yes') return { word, ok: true as const, suggestions: [] as string[], soft: false };
    const suggestions = await spellingSuggestions(lemma);
    if (status === 'unknown' && !suggestions.length) {
      /* Offline / API blip — allow plausible shapes rather than blocking paste. */
      return { word, ok: true as const, suggestions: [], soft: true };
    }
    return { word, ok: false as const, suggestions, soft: false };
  });

  for (const row of lookups) {
    if (row.ok) {
      accepted.push(row.word);
      continue;
    }

    const lemma = lemmaOf(row.word);
    const close = row.suggestions.filter((s) => editDistance(lemma, s) <= 2);
    if (close.length === 1 && editDistance(lemma, close[0]) === 1) {
      const fixed = displayWord(close[0]);
      corrected.push({ from: row.word, to: fixed });
      accepted.push(fixed);
      continue;
    }

    rejected.push({
      word: row.word,
      suggestions: (close.length ? close : row.suggestions).slice(0, 3).map(displayWord),
    });
  }

  // De-dupe accepted after corrections
  const final: string[] = [];
  const finalSeen = new Set<string>();
  for (const word of accepted) {
    const lemma = lemmaOf(word);
    if (finalSeen.has(lemma)) continue;
    finalSeen.add(lemma);
    final.push(word);
  }

  return { accepted: final, corrected, rejected };
}
