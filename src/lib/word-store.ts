import { antonymsFor, prefetchEntries, type Definition, type Sense, type WordEntry } from './dictionary';
import { readEntryCache, writeEntryCache, type CachedEntry } from './entry-cache';
import type { Language } from './learner';
import { createBrowserSupabase } from './supabase';

/** What the admin queue saved for a word. `entry` is undefined until the dictionary part is done. */
type Saved = CachedEntry;

type Row = {
  lemma: string;
  enrichment: unknown;
  enriched_at: string | null;
  auto_ta: string | null;
  auto_hi: string | null;
  translated_at: string | null;
};

const CHUNK = 100;
const saved = new Map<string, Saved>();
const loading = new Map<string, Promise<void>>();
/** Set when the saved columns can't be read (sample mode, migration not run); everything is then looked up live. */
let unavailable = false;
let owner: string | null = null;
const warmed = new Set<string>();

export function setEntryOwner(userId: string | null) {
  if (owner === userId) return;
  owner = userId;
  saved.clear();
  loading.clear();
  warmed.clear();
}

const strings = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : []);

function asEntry(value: unknown): WordEntry | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const v = value as Record<string, unknown>;
  const senses: Sense[] = (Array.isArray(v.senses) ? v.senses : [])
    .filter((s): s is { pos: string; definitions: unknown[] } => !!s && typeof s.pos === 'string' && Array.isArray(s.definitions))
    .map((s) => ({
      pos: s.pos,
      definitions: s.definitions
        .filter((d): d is Definition => !!d && typeof (d as Definition).text === 'string')
        .map((d) => ({ text: d.text, example: typeof d.example === 'string' ? d.example : null })),
    }));
  return {
    found: v.found === true,
    phonetic: typeof v.phonetic === 'string' ? v.phonetic : null,
    audio: typeof v.audio === 'string' ? v.audio : null,
    senses,
    synonyms: strings(v.synonyms),
    antonyms: strings(v.antonyms),
    examples: strings(v.examples),
    gist: strings(v.gist),
  };
}

async function fetchSaved(lemmas: string[]) {
  try {
    if (owner) {
      const cached = await readEntryCache(owner, lemmas);
      for (const [lemma, row] of cached) saved.set(lemma, row);
    }
    const missing = lemmas.filter((l) => !saved.has(l));
    if (!missing.length) return;
    const sb = createBrowserSupabase();
    for (let i = 0; i < missing.length; i += CHUNK) {
      const slice = missing.slice(i, i + CHUNK);
      const { data, error } = await sb
        .from('core_words')
        .select('lemma, enrichment, enriched_at, auto_ta, auto_hi, translated_at')
        .in('lemma', slice);
      if (error) throw new Error(error.message);
      const rows: Array<{ lemma: string } & CachedEntry> = [];
      for (const row of (data ?? []) as Row[]) {
        const next: Saved = {
          entry: row.enriched_at ? asEntry(row.enrichment) : undefined,
          ...(row.translated_at ? { ta: row.auto_ta, hi: row.auto_hi } : {}),
          enrichedAt: row.enriched_at,
          translatedAt: row.translated_at,
        };
        saved.set(row.lemma, next);
        rows.push({ lemma: row.lemma, ...next });
      }
      if (owner && rows.length) void writeEntryCache(owner, rows);
    }
  } catch {
    unavailable = true;
  }
}

function loadSaved(lemmas: string[]) {
  if (unavailable) return Promise.resolve();
  const need = lemmas.filter((l) => !loading.has(l) && !saved.has(l));
  for (let i = 0; i < need.length; i += CHUNK) {
    const slice = need.slice(i, i + CHUNK);
    const pending = fetchSaved(slice);
    slice.forEach((l) => loading.set(l, pending));
  }
  return Promise.all(lemmas.map((l) => loading.get(l) ?? Promise.resolve())).then(() => undefined);
}

export type EntrySyncStatus = {
  total: number;
  stored: number;
  missing: number;
  stale: number;
};

function newer(server: string | null | undefined, local: string | null | undefined) {
  if (!server) return false;
  if (!local) return true;
  return Date.parse(server) > Date.parse(local);
}

type StampRow = { lemma: string; enriched_at: string | null; translated_at: string | null };

async function readStamps(lemmas: string[]) {
  const sb = createBrowserSupabase();
  const out = new Map<string, StampRow>();
  for (let i = 0; i < lemmas.length; i += CHUNK) {
    const slice = lemmas.slice(i, i + CHUNK);
    const { data, error } = await sb.from('core_words').select('lemma, enriched_at, translated_at').in('lemma', slice);
    if (error) throw new Error(error.message);
    for (const row of (data ?? []) as StampRow[]) out.set(row.lemma, row);
  }
  return out;
}

/** Compare this device's copy of a track with Supabase. */
export async function checkEntrySync(lemmas: string[], userId?: string | null): Promise<EntrySyncStatus> {
  if (userId !== undefined) setEntryOwner(userId);
  const keys = [...new Set(lemmas.map((l) => l.toLowerCase()))];
  const empty = { total: keys.length, stored: 0, missing: keys.length, stale: 0 };
  if (!keys.length) return { total: 0, stored: 0, missing: 0, stale: 0 };
  if (!owner) return empty;
  const local = await readEntryCache(owner, keys);
  for (const [lemma, row] of local) {
    if (!saved.has(lemma)) saved.set(lemma, row);
  }
  const stamps = await readStamps(keys);
  let stored = 0;
  let missing = 0;
  let stale = 0;
  for (const key of keys) {
    const row = saved.get(key) ?? local.get(key);
    const stamp = stamps.get(key);
    if (!row) {
      missing += 1;
      continue;
    }
    stored += 1;
    if (stamp && (newer(stamp.enriched_at, row.enrichedAt) || newer(stamp.translated_at, row.translatedAt))) stale += 1;
  }
  return { total: keys.length, stored, missing, stale };
}

/** Re-download words that are missing or newer on the server. */
export async function syncEntries(lemmas: string[], userId?: string | null) {
  if (userId !== undefined) setEntryOwner(userId);
  const keys = [...new Set(lemmas.map((l) => l.toLowerCase()))];
  if (owner) {
    const local = await readEntryCache(owner, keys);
    for (const [lemma, row] of local) {
      if (!saved.has(lemma)) saved.set(lemma, row);
    }
  }
  const stamps = owner ? await readStamps(keys) : new Map<string, StampRow>();
  const dirty = keys.filter((key) => {
    const row = saved.get(key);
    const stamp = stamps.get(key);
    return !row || (stamp && (newer(stamp.enriched_at, row.enrichedAt) || newer(stamp.translated_at, row.translatedAt)));
  });
  for (const key of dirty) {
    saved.delete(key);
    loading.delete(key);
  }
  warmed.clear();
  await loadSaved(dirty);
  return checkEntrySync(keys);
}

export async function storedEntryCount(lemmas: string[], userId?: string | null) {
  if (userId !== undefined) setEntryOwner(userId);
  const keys = [...new Set(lemmas.map((l) => l.toLowerCase()))];
  if (!owner || !keys.length) return 0;
  const local = await readEntryCache(owner, keys);
  return keys.filter((key) => saved.has(key) || local.has(key)).length;
}

/** Pull this track's saved details onto the device in the background, a chunk at a time. */
export function warmEntries(lemmas: string[]) {
  const keys = [...new Set(lemmas.map((l) => l.toLowerCase()))];
  const id = `${owner ?? 'local'}:${keys.length}`;
  if (!keys.length || warmed.has(id)) return;
  warmed.add(id);
  void loadSaved(keys);
}

/** Saved details where the admin queue has done the word; a live dictionary lookup only for the rest. */
export async function entriesFor(lemmas: string[]) {
  const keys = [...new Set(lemmas.map((l) => l.toLowerCase()))];
  await loadSaved(keys);
  const out = new Map<string, WordEntry | null>();
  const live: string[] = [];
  for (const key of keys) {
    const entry = saved.get(key)?.entry;
    if (entry) out.set(key, entry);
    else live.push(key);
  }
  if (live.length) {
    const found: Array<{ lemma: string } & CachedEntry> = [];
    for (const [key, entry] of await prefetchEntries(live)) {
      out.set(key, entry);
      if (entry) {
        const next = { ...saved.get(key), entry };
        saved.set(key, next);
        found.push({ lemma: key, ...next });
      }
    }
    if (owner && found.length) void writeEntryCache(owner, found);
  }
  void Promise.all(
    [...out.entries()].map(async ([key, entry]) => {
      if (!entry || entry.antonyms.length) return;
      entry.antonyms = await antonymsFor(key, entry.synonyms);
    }),
  );
  return out;
}

export async function entryFor(lemma: string) {
  return (await entriesFor([lemma])).get(lemma.toLowerCase()) ?? null;
}

/** The saved automatic translation: a string, null when there is none, undefined when not translated yet. */
export function savedTongue(lemma: string, language: Language): string | null | undefined {
  if (language === 'en') return null;
  return saved.get(lemma.toLowerCase())?.[language] ?? undefined;
}

/** Device copy of a dictionary entry, if we already stored one. */
export async function peekEntry(lemma: string) {
  const key = lemma.toLowerCase();
  const mem = saved.get(key)?.entry;
  if (mem) return mem;
  if (!owner) return undefined;
  const cached = await readEntryCache(owner, [key]);
  const row = cached.get(key);
  if (!row) return undefined;
  saved.set(key, { ...saved.get(key), ...row });
  return row.entry;
}

/** Keep a looked-up dictionary entry so the study card does not fetch it again. */
export function rememberEntry(lemma: string, entry: WordEntry) {
  const key = lemma.toLowerCase();
  const next = { ...saved.get(key), entry };
  saved.set(key, next);
  if (owner) void writeEntryCache(owner, [{ lemma: key, ...next }]);
}

/** Keep a live lookup so the same word is not sent to Azure again this session. */
export function rememberTongue(lemma: string, language: Language, text: string | null) {
  if (language === 'en' || !text) return;
  const key = lemma.toLowerCase();
  saved.set(key, { ...saved.get(key), [language]: text });
}
