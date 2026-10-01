import type { Definition, Sense, WordEntry } from './dictionary';

/** Teacher changes layered on top of the live dictionary result. Only these are stored. */
export type WordOverrides = {
  meaning?: string;
  hide?: string[];
  add?: { pos: string; text: string; example?: string }[];
  synonyms?: string[];
  antonyms?: string[];
};

export type FallbackWord = {
  pos: string | null;
  meaning: string | null;
  synonym: string | null;
  antonym: string | null;
  examples: string[];
};

export type ResolvedWord = {
  phonetic: string | null;
  audio: string | null;
  senses: Sense[];
  types: string[];
  primary: string | null;
  /** A few short words summing up the meaning, shown large: accurate = exact. */
  gist: string[];
  /** Word type of the primary meaning, when known. */
  primaryPos: string | null;
  /** Sentences using the word that are not already shown under a meaning. */
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  source: 'live' | 'saved' | 'none';
};

export const WORD_TYPES = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'interjection',
  'determiner',
] as const;

function words(value: unknown) {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && !!v.trim()).map((v) => v.trim()) : undefined;
}

export function parseOverrides(value: unknown): WordOverrides {
  if (!value || typeof value !== 'object') return {};
  const v = value as Record<string, unknown>;
  const add = Array.isArray(v.add)
    ? v.add
        .filter((a): a is { pos: string; text: string; example?: string } => !!a && typeof a.pos === 'string' && typeof a.text === 'string' && !!a.text.trim())
        .map((a) => ({ pos: a.pos, text: a.text.trim(), example: typeof a.example === 'string' && a.example.trim() ? a.example.trim() : undefined }))
    : undefined;
  return {
    meaning: typeof v.meaning === 'string' && v.meaning.trim() ? v.meaning.trim() : undefined,
    hide: words(v.hide),
    add: add?.length ? add : undefined,
    synonyms: words(v.synonyms),
    antonyms: words(v.antonyms),
  };
}

function splitList(text: string | null) {
  return text ? text.split(',').map((s) => s.trim()).filter(Boolean) : [];
}

function uniqueWords(list: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const word = raw.trim();
    if (!word) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(word);
  }
  return out;
}

const isShort = (text: string) => text.replace(/[.!]$/, '').split(/\s+/).length <= 4;

function gistFor(primary: string | null, overrides: WordOverrides, entry: WordEntry | null | undefined) {
  if (overrides.meaning) return isShort(overrides.meaning) ? [overrides.meaning.replace(/[.!]$/, '')] : [];
  if (entry?.gist?.length) return entry.gist;
  return primary && isShort(primary) ? [primary.replace(/[.!]$/, '')] : [];
}

export function resolveWord(entry: WordEntry | null | undefined, overrides: WordOverrides, fallback: FallbackWord): ResolvedWord {
  const hidden = new Set(overrides.hide ?? []);
  const groups = new Map<string, Definition[]>();
  for (const sense of entry?.senses ?? []) {
    const visible = sense.definitions.filter((d) => !hidden.has(d.text));
    if (visible.length) groups.set(sense.pos, visible);
  }
  for (const a of overrides.add ?? []) {
    const list = groups.get(a.pos) ?? [];
    list.push({ text: a.text, example: a.example ?? null });
    groups.set(a.pos, list);
  }

  let source: ResolvedWord['source'] = entry?.senses.length ? 'live' : 'none';
  if (!groups.size && fallback.meaning) {
    groups.set(fallback.pos || 'meaning', [{ text: fallback.meaning, example: fallback.examples[0] ?? null }]);
    source = 'saved';
  }
  const senses = [...groups.entries()].map(([pos, definitions]) => ({ pos, definitions }));
  const primary = overrides.meaning ?? senses[0]?.definitions[0]?.text ?? fallback.meaning;
  const primaryPos = senses.find((s) => s.definitions.some((d) => d.text === primary))?.pos ?? null;
  const shown = new Set(senses.flatMap((s) => s.definitions.map((d) => d.example?.toLowerCase())));
  const examples: string[] = [];
  for (const ex of [...(entry?.examples ?? []), ...fallback.examples]) {
    const key = ex.toLowerCase();
    if (shown.has(key)) continue;
    shown.add(key);
    examples.push(ex);
  }

  return {
    phonetic: entry?.phonetic ?? null,
    audio: entry?.audio ?? null,
    senses,
    types: senses.map((s) => s.pos).filter((p) => p !== 'meaning'),
    primary,
    gist: gistFor(primary, overrides, entry),
    primaryPos: primaryPos === 'meaning' ? null : primaryPos,
    examples: examples.slice(0, 6),
    synonyms: overrides.synonyms ?? uniqueWords([...(entry?.synonyms ?? []), ...splitList(fallback.synonym)]),
    antonyms: overrides.antonyms ?? uniqueWords([...(entry?.antonyms ?? []), ...splitList(fallback.antonym)]),
    source,
  };
}
