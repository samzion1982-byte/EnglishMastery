import { classifyLemma } from './classify';
import type { Bucket, CoreStore, LiveBucket } from './vocab';
import { inCore } from './vocab';

export function ingestWords(store: CoreStore, incoming: { word: string; lemma: string }[], batchId: string, now = Date.now()) {
  let filed = 0;
  let merged = 0;
  let queued = 0;

  for (const item of incoming) {
    const existing = inCore(store, item.lemma);
    if (existing) {
      merged += 1;
      continue;
    }
    store.doubts = store.doubts.filter((d) => d.lemma !== item.lemma);

    const result = classifyLemma(item.word);
    if (result.doubt) {
      store.doubts.push({
        id: `${batchId}-${item.lemma}`,
        word: item.word,
        lemma: item.lemma,
        suggested: result.bucket,
        confidence: result.confidence,
        reason: result.reason,
      });
      queued += 1;
      continue;
    }

    store.words.push({
      id: `${batchId}-${item.lemma}`,
      word: item.word,
      lemma: item.lemma,
      bucket: result.bucket,
      addedAt: now,
      batchId,
      isNew: true,
      confidence: result.confidence,
      auto: true,
    });
    filed += 1;
  }

  return { filed, merged, queued };
}

export function acceptDoubt(store: CoreStore, lemma: string, bucket: LiveBucket, now = Date.now()) {
  const doubt = store.doubts.find((d) => d.lemma === lemma);
  if (!doubt) return;
  store.doubts = store.doubts.filter((d) => d.lemma !== lemma);
  if (inCore(store, lemma)) return;
  store.words.push({
    id: doubt.id,
    word: doubt.word,
    lemma: doubt.lemma,
    bucket,
    addedAt: now,
    batchId: doubt.id,
    isNew: true,
    confidence: doubt.confidence,
    auto: false,
  });
}

/** Re-sort the review queue with the current classifier and file every word. */
export function autoFileDoubts(store: CoreStore, now = Date.now()) {
  const pending = [...store.doubts];
  store.doubts = [];
  let filed = 0;
  for (const doubt of pending) {
    if (inCore(store, doubt.lemma)) continue;
    const result = classifyLemma(doubt.word);
    store.words.push({
      id: doubt.id,
      word: doubt.word,
      lemma: doubt.lemma,
      bucket: result.bucket,
      addedAt: now,
      batchId: doubt.id,
      isNew: true,
      confidence: result.confidence,
      auto: true,
    });
    filed += 1;
  }
  return filed;
}

export function moveWord(store: CoreStore, lemma: string, bucket: Bucket) {
  const word = inCore(store, lemma);
  if (!word || word.bucket === bucket) return;
  word.bucket = bucket;
  word.auto = false;
  word.isNew = bucket !== 'archive';
}

export function archiveWord(store: CoreStore, lemma: string) {
  moveWord(store, lemma, 'archive');
}

/** Permanently remove a word from the store (Archive trash). */
export function removeWord(store: CoreStore, lemma: string) {
  store.words = store.words.filter((w) => w.lemma !== lemma);
  store.doubts = store.doubts.filter((d) => d.lemma !== lemma);
}

export function ingestIntoBucket(
  store: CoreStore,
  incoming: { word: string; lemma: string }[],
  bucket: Bucket,
  batchId: string,
  now = Date.now(),
) {
  let filed = 0;
  let merged = 0;
  let moved = 0;

  for (const item of incoming) {
    const existing = inCore(store, item.lemma);
    if (existing) {
      if (existing.bucket === bucket) {
        merged += 1;
        continue;
      }
      existing.bucket = bucket;
      existing.auto = false;
      existing.isNew = bucket !== 'archive';
      store.doubts = store.doubts.filter((d) => d.lemma !== item.lemma);
      moved += 1;
      continue;
    }
    store.doubts = store.doubts.filter((d) => d.lemma !== item.lemma);
    store.words.push({
      id: `${batchId}-${item.lemma}`,
      word: item.word,
      lemma: item.lemma,
      bucket,
      addedAt: now,
      batchId,
      isNew: bucket !== 'archive',
      confidence: 100,
      auto: false,
    });
    filed += 1;
  }

  return { filed, merged, moved };
}

export function ingestAssigned(
  store: CoreStore,
  incoming: {
    word: string;
    lemma: string;
    bucket: LiveBucket;
    confidence?: number;
    reason?: string;
    doubt?: boolean;
  }[],
  batchId: string,
  now = Date.now(),
) {
  let filed = 0;
  let merged = 0;
  let queued = 0;

  for (const item of incoming) {
    const existing = inCore(store, item.lemma);
    if (existing) {
      merged += 1;
      continue;
    }
    store.doubts = store.doubts.filter((d) => d.lemma !== item.lemma);

    const classified = classifyLemma(item.word);
    const doubt = item.doubt ?? classified.doubt;
    const confidence = item.confidence ?? classified.confidence;
    const reason = item.reason ?? classified.reason;
    const bucket = item.bucket;

    if (doubt) {
      store.doubts.push({
        id: `${batchId}-${item.lemma}`,
        word: item.word,
        lemma: item.lemma,
        suggested: bucket,
        confidence,
        reason,
      });
      queued += 1;
      continue;
    }

    store.words.push({
      id: `${batchId}-${item.lemma}`,
      word: item.word,
      lemma: item.lemma,
      bucket,
      addedAt: now,
      batchId,
      isNew: true,
      confidence,
      auto: true,
    });
    filed += 1;
  }

  return { filed, merged, queued };
}

export function flushBuckets(store: CoreStore) {
  store.words = [];
  store.doubts = [];
}

/** Re-classify every live (non-archive) word with the current sorter. */
export function resortLiveWords(store: CoreStore) {
  let moved = 0;
  for (const word of store.words) {
    if (word.bucket === 'archive') continue;
    const result = classifyLemma(word.word);
    if (result.bucket !== word.bucket) {
      word.bucket = result.bucket;
      moved += 1;
    }
    word.confidence = result.confidence;
    word.auto = true;
  }
  return { total: store.words.filter((w) => w.bucket !== 'archive').length, moved };
}

export function clearNew(store: CoreStore) {
  store.words.forEach((w) => {
    w.isNew = false;
  });
}
