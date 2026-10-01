export type LiveBucket = 'beginner' | 'intermediate' | 'advanced';
export type Bucket = LiveBucket | 'archive';

export type CoreWord = {
  id: string;
  word: string;
  lemma: string;
  bucket: Bucket;
  addedAt: number;
  batchId: string;
  isNew: boolean;
  confidence: number;
  auto: boolean;
};

export type DoubtItem = {
  id: string;
  word: string;
  lemma: string;
  suggested: LiveBucket;
  confidence: number;
  reason: string;
};

export type CoreStore = {
  words: CoreWord[];
  doubts: DoubtItem[];
};

export const CORE_KEY = 'em-core-vocab-v1';
export const liveBuckets: LiveBucket[] = ['beginner', 'intermediate', 'advanced'];
export const buckets: Bucket[] = ['beginner', 'intermediate', 'advanced', 'archive'];
export const bucketLabel: Record<Bucket, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  archive: 'Archive',
};

export function lemmaOf(raw: string) {
  return raw.normalize('NFKC').trim().toLowerCase().replace(/[^a-z'-]+/g, '');
}

/** Dictionary lookup key. Keeps spaces and hyphens so "post office" is not searched as "postoffice". */
export function phraseOf(raw: string) {
  return raw
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[_]+/g, ' ')
    .replace(/[^a-z'\- ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function displayWord(raw: string) {
  const clean = raw.trim().replace(/\s+/g, ' ');
  if (!clean) return '';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function parseWordList(text: string) {
  const parts = text.split(/[\n,;|\t]+/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const word = displayWord(part.replace(/^\d+[\).:-]\s*/, ''));
    const lemma = lemmaOf(word);
    if (lemma.length < 2 || seen.has(lemma)) continue;
    seen.add(lemma);
    out.push(word);
  }
  return out;
}

export function emptyStore(): CoreStore {
  return { words: [], doubts: [] };
}

export function loadStore(): CoreStore {
  try {
    const raw = JSON.parse(localStorage.getItem(CORE_KEY) || 'null');
    if (!raw || !Array.isArray(raw.words)) return emptyStore();
    return {
      words: raw.words.filter((w: CoreWord) => w && typeof w.lemma === 'string' && buckets.includes(w.bucket)),
      doubts: Array.isArray(raw.doubts) ? raw.doubts : [],
    };
  } catch {
    return emptyStore();
  }
}

export function saveStore(store: CoreStore) {
  localStorage.setItem(CORE_KEY, JSON.stringify(store));
}

export function inCore(store: CoreStore, lemma: string) {
  return store.words.find((w) => w.lemma === lemma);
}
