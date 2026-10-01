import type { SupabaseClient } from '@supabase/supabase-js';
import type { CoreStore, CoreWord, LiveBucket } from './vocab';
import { parseOverrides, type WordOverrides } from './word-overrides';

type ServerWord = {
  lemma: string;
  display_word: string;
  bucket: LiveBucket;
  status: 'draft' | 'published' | 'retired';
  list_order: number;
  is_new: boolean;
  confidence: number | null;
  classified_by: string | null;
};

export type SnapshotEntry = { display: string; bucket: LiveBucket; status: ServerWord['status'] };
export type Snapshot = Map<string, SnapshotEntry>;

const PAGE = 1000;
const CHUNK = 500;

export async function fetchServerWords(sb: SupabaseClient) {
  const rows: ServerWord[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from('core_words')
      .select('lemma, display_word, bucket, status, list_order, is_new, confidence, classified_by')
      .order('list_order', { ascending: true })
      .order('lemma', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as ServerWord[]));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

export function snapshotOf(rows: ServerWord[]): Snapshot {
  return new Map(
    rows.map((r) => [r.lemma, { display: r.display_word, bucket: r.bucket, status: r.status }]),
  );
}

/** Server is the source of truth; local metadata (batch, id) is kept where the lemma matches. */
export function storeFromServer(rows: ServerWord[], local: CoreStore): CoreStore {
  const byLemma = new Map(local.words.map((w) => [w.lemma, w]));
  const words: CoreWord[] = rows.map((r) => {
    const prev = byLemma.get(r.lemma);
    return {
      id: prev?.id ?? `s-${r.lemma}`,
      word: r.display_word,
      lemma: r.lemma,
      bucket: r.status === 'retired' ? 'archive' : r.bucket,
      addedAt: Number(r.list_order) || Date.now(),
      batchId: prev?.batchId ?? 'server',
      isNew: r.is_new,
      confidence: r.confidence ?? prev?.confidence ?? 0,
      auto: r.classified_by !== 'human',
    };
  });
  const lemmas = new Set(rows.map((r) => r.lemma));
  return { words, doubts: local.doubts.filter((d) => !lemmas.has(d.lemma)) };
}

function rowFor(word: CoreWord, prev: SnapshotEntry | undefined) {
  const retired = word.bucket === 'archive';
  return {
    lemma: word.lemma,
    display_word: word.word,
    bucket: (retired ? (prev?.bucket ?? 'beginner') : word.bucket) as LiveBucket,
    status: (retired ? 'retired' : 'published') as SnapshotEntry['status'],
    list_order: Math.round(word.addedAt),
    is_new: word.isNew,
    confidence: Math.max(0, Math.min(100, Math.round(word.confidence || 0))),
    classified_by: word.auto ? 'heuristic' : 'human',
  };
}

/** Push the difference between the last known server state and the local store. */
export async function syncToServer(sb: SupabaseClient, store: CoreStore, snapshot: Snapshot) {
  const upserts: ReturnType<typeof rowFor>[] = [];
  const keep = new Set<string>();
  for (const word of store.words) {
    keep.add(word.lemma);
    const prev = snapshot.get(word.lemma);
    const row = rowFor(word, prev);
    if (!prev || prev.display !== row.display_word || prev.bucket !== row.bucket || prev.status !== row.status) {
      upserts.push(row);
    }
  }
  const deletes = [...snapshot.keys()].filter((lemma) => !keep.has(lemma));

  for (let i = 0; i < upserts.length; i += CHUNK) {
    const { error } = await sb.from('core_words').upsert(upserts.slice(i, i + CHUNK), { onConflict: 'lemma' });
    if (error) throw new Error(error.message);
  }
  for (let i = 0; i < deletes.length; i += CHUNK) {
    const { error } = await sb.from('core_words').delete().in('lemma', deletes.slice(i, i + CHUNK));
    if (error) throw new Error(error.message);
  }

  const next: Snapshot = new Map(snapshot);
  for (const lemma of deletes) next.delete(lemma);
  for (const row of upserts) {
    next.set(row.lemma, { display: row.display_word, bucket: row.bucket, status: row.status });
  }
  return { snapshot: next, pushed: upserts.length, deleted: deletes.length };
}

/** Meanings a teacher writes in the student's mother tongue. They replace the automatic translation. */
export type Translations = { ta: string | null; hi: string | null };

export async function readOverrides(sb: SupabaseClient, lemma: string) {
  const { data, error } = await sb.from('core_words').select('overrides, meaning_ta, meaning_hi').eq('lemma', lemma).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('This word is not saved to Supabase yet.');
  const row = data as { overrides: unknown; meaning_ta: string | null; meaning_hi: string | null };
  return { overrides: parseOverrides(row.overrides), translations: { ta: row.meaning_ta, hi: row.meaning_hi } };
}

export async function saveOverrides(sb: SupabaseClient, lemma: string, overrides: WordOverrides, translations: Translations) {
  const { data, error } = await sb
    .from('core_words')
    .update({ overrides, meaning_ta: translations.ta, meaning_hi: translations.hi })
    .eq('lemma', lemma)
    .select('lemma');
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error('This word is not saved to Supabase yet.');
}
