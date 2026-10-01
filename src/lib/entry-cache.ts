import type { WordEntry } from './dictionary';

const DB = 'em-entry-v1';
const STORE = 'entry';
const VERSION = 1;

export type CachedEntry = {
  entry?: WordEntry;
  ta?: string | null;
  hi?: string | null;
  ml?: string | null;
  te?: string | null;
  kn?: string | null;
  fr?: string | null;
  enrichedAt?: string | null;
  translatedAt?: string | null;
};

function keyOf(userId: string, lemma: string) {
  return `${userId}:${lemma}`;
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function readEntryCache(userId: string, lemmas: string[]) {
  const out = new Map<string, CachedEntry>();
  if (!lemmas.length) return out;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const store = db.transaction(STORE, 'readonly').objectStore(STORE);
      let left = lemmas.length;
      for (const lemma of lemmas) {
        const req = store.get(keyOf(userId, lemma));
        req.onsuccess = () => {
          const row = req.result as CachedEntry | undefined;
          if (row) out.set(lemma, row);
          left -= 1;
          if (!left) resolve();
        };
        req.onerror = () => reject(req.error);
      }
    });
  } catch {
    /* Private mode or first visit. */
  }
  return out;
}

export async function writeEntryCache(userId: string, rows: Array<{ lemma: string } & CachedEntry>) {
  if (!rows.length) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      for (const row of rows) {
        store.put(
          { entry: row.entry, ta: row.ta, hi: row.hi, enrichedAt: row.enrichedAt, translatedAt: row.translatedAt },
          keyOf(userId, row.lemma),
        );
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* Quota: keep using the network. */
  }
}

export async function clearEntryCache(userId: string | null) {
  if (!userId) return;
  try {
    const db = await openDb();
    const prefix = `${userId}:`;
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const req = store.openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) return;
        if (String(cursor.key).startsWith(prefix)) cursor.delete();
        cursor.continue();
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignore */
  }
}
