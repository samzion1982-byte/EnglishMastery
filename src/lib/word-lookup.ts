import { getEntry, type WordEntry } from './dictionary';
import type { StudyWord } from './learner';
import { createBrowserSupabase } from './supabase';
import { displayWord, lemmaOf, phraseOf, type LiveBucket } from './vocab';
import { parseOverrides } from './word-overrides';
import { peekEntry, rememberEntry } from './word-store';

export type WordLookup = { word: StudyWord; inRepo: boolean };

const BUCKETS: LiveBucket[] = ['beginner', 'intermediate', 'advanced'];

function asBucket(value: unknown): LiveBucket {
  return BUCKETS.includes(value as LiveBucket) ? (value as LiveBucket) : 'intermediate';
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && !!v.trim()) : [];
}

function fromList(query: string, words: StudyWord[]) {
  const lemma = lemmaOf(query);
  const lower = query.trim().toLowerCase();
  return words.find((w) => w.lemma === lemma || w.word.toLowerCase() === lower) ?? null;
}

function fromOnline(query: string, entry: WordEntry): StudyWord {
  const lemma = lemmaOf(query);
  const primary = entry.senses[0]?.definitions[0];
  return {
    id: `lookup-${lemma}`,
    word: displayWord(query) || lemma,
    lemma,
    bucket: 'intermediate',
    pos: entry.senses[0]?.pos ?? null,
    meaning: primary?.text ?? null,
    ta: null,
    hi: null,
    synonym: entry.synonyms[0] ?? null,
    antonym: entry.antonyms[0] ?? null,
    examples: [primary?.example, ...entry.examples].filter((s): s is string => !!s),
    distractors: [],
    overrides: {},
  };
}

type RepoRow = {
  id: string;
  lemma: string;
  display_word: string;
  bucket: string;
  part_of_speech: string | null;
  meaning: string | null;
  meaning_ta: string | null;
  meaning_hi: string | null;
  synonym: string | null;
  antonym: string | null;
  examples: unknown;
  distractors: unknown;
  overrides?: unknown;
  enrichment?: unknown;
  enriched_at?: string | null;
  auto_ta?: string | null;
  auto_hi?: string | null;
  translated_at?: string | null;
};

function fromRepo(row: RepoRow): StudyWord {
  return {
    id: row.id,
    word: row.display_word,
    lemma: row.lemma,
    bucket: asBucket(row.bucket),
    pos: row.part_of_speech,
    meaning: row.meaning,
    ta: row.meaning_ta || row.auto_ta || null,
    hi: row.meaning_hi || row.auto_hi || null,
    synonym: row.synonym,
    antonym: row.antonym,
    examples: strings(row.examples),
    distractors: strings(row.distractors),
    overrides: parseOverrides(row.overrides),
  };
}

async function fromSupabase(lemma: string) {
  try {
    const sb = createBrowserSupabase();
    const { data, error } = await sb
      .from('core_words')
      .select(
        'id, lemma, display_word, bucket, part_of_speech, meaning, meaning_ta, meaning_hi, synonym, antonym, examples, distractors, overrides, enrichment, enriched_at, auto_ta, auto_hi, translated_at',
      )
      .eq('lemma', lemma)
      .eq('status', 'published')
      .maybeSingle();
    if (error || !data) return null;
    const row = data as RepoRow;
    if (row.enriched_at && row.enrichment && typeof row.enrichment === 'object') {
      rememberEntry(row.lemma, row.enrichment as WordEntry);
    }
    return fromRepo(row);
  } catch {
    return null;
  }
}

export type WordSuggest = { word: string; lemma: string; inRepo: boolean };

/** Instant matches from the words already on this device. Prefix hits come first. */
export function suggestLocal(query: string, words: StudyWord[], limit = 8): WordSuggest[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  const prefix: WordSuggest[] = [];
  const rest: WordSuggest[] = [];
  const seen = new Set<string>();
  for (const w of words) {
    const word = w.word.toLowerCase();
    const hit = word.startsWith(q) || w.lemma.startsWith(q) ? prefix : word.includes(q) || w.lemma.includes(q) ? rest : null;
    if (!hit || seen.has(w.lemma)) continue;
    seen.add(w.lemma);
    hit.push({ word: w.word, lemma: w.lemma, inRepo: true });
    if (prefix.length >= limit) break;
  }
  return [...prefix, ...rest].slice(0, limit);
}

/** Live spelling / completion hints (Datamuse), for words not already in the local list. */
export async function suggestOnline(query: string, have: Set<string>, signal?: AbortSignal): Promise<WordSuggest[]> {
  const q = lemmaOf(query);
  if (q.length < 2) return [];
  try {
    const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(q)}&max=10`, {
      signal: signal ?? AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as { word?: string }[];
    const out: WordSuggest[] = [];
    for (const row of rows) {
      const lemma = lemmaOf(row.word || '');
      if (!lemma || have.has(lemma)) continue;
      if (lemma === q && !/[\s-]/.test(row.word || '')) continue;
      out.push({ word: displayWord(row.word || lemma), lemma, inRepo: false });
    }
    return out;
  } catch {
    return [];
  }
}

/** Local list → device cache / Supabase → live dictionaries. */
export async function lookupStudyWord(query: string, words: StudyWord[]): Promise<WordLookup | null> {
  const lemma = lemmaOf(query);
  const phrase = phraseOf(query);
  if (lemma.length < 2) return null;

  const local = fromList(query, words);
  if (local) return { word: local, inRepo: true };

  const remote = await fromSupabase(lemma);
  if (remote) return { word: remote, inRepo: true };

  const keys = [...new Set([phrase, lemma].filter((key) => key.length >= 2))];
  if (phrase === lemma) {
    const split = (await suggestOnline(query, new Set())).find((row) => lemmaOf(row.word) === lemma && /[\s-]/.test(row.word));
    if (split) keys.unshift(phraseOf(split.word));
  }

  for (const key of keys) {
    const cached = await peekEntry(key);
    if (cached?.found) return { word: fromOnline(query, cached), inRepo: false };
    const entry = await getEntry(key);
    if (!entry?.found) continue;
    rememberEntry(key, entry);
    return { word: fromOnline(displayWord(key), entry), inRepo: false };
  }
  return null;
}

/** Staff only: publish a looked-up word so students see it in the list. */
export async function addLookedUpWord(word: StudyWord, bucket: LiveBucket, entry?: WordEntry | null) {
  const res = await fetch('/api/vocab/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      word: word.word,
      lemma: word.lemma,
      bucket,
      pos: word.pos ?? entry?.senses[0]?.pos ?? null,
      meaning: word.meaning ?? entry?.senses[0]?.definitions[0]?.text ?? null,
      synonym: word.synonym ?? entry?.synonyms[0] ?? null,
      antonym: word.antonym ?? entry?.antonyms[0] ?? null,
      examples: word.examples.length ? word.examples : entry?.examples ?? [],
      entry: entry?.found ? entry : undefined,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { word?: StudyWord; error?: string };
  if (!res.ok || !body.word) throw new Error(body.error || 'The word could not be saved.');
  if (entry?.found) rememberEntry(body.word.lemma, entry);
  return body.word;
}
