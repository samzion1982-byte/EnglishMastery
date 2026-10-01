import type { AppendixCategory, AppendixItem } from './appendix';

const DB = 'em-appendix-v1';
const CATALOG = 'catalog';
const BRIEFS = 'briefs';
const VERSION = 1;
const BRIEF_TTL = 1000 * 60 * 60 * 24 * 30;

export type AppendixCatalog = {
  categories: AppendixCategory[];
  items: AppendixItem[];
  savedAt: number;
};

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(CATALOG)) db.createObjectStore(CATALOG);
      if (!db.objectStoreNames.contains(BRIEFS)) db.createObjectStore(BRIEFS);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function readAppendixCatalog(): Promise<AppendixCatalog | null> {
  try {
    const db = await openDb();
    const row = await new Promise<AppendixCatalog | undefined>((resolve, reject) => {
      const req = db.transaction(CATALOG, 'readonly').objectStore(CATALOG).get('published');
      req.onsuccess = () => resolve(req.result as AppendixCatalog | undefined);
      req.onerror = () => reject(req.error);
    });
    if (!row?.categories || !row.items) return null;
    return row;
  } catch {
    return null;
  }
}

export async function writeAppendixCatalog(catalog: Omit<AppendixCatalog, 'savedAt'>) {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(CATALOG, 'readwrite');
      tx.objectStore(CATALOG).put({ ...catalog, savedAt: Date.now() }, 'published');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* Quota or private mode: the network copy still works. */
  }
}

export async function readAppendixBriefs() {
  const out = new Map<string, string | null>();
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const req = db.transaction(BRIEFS, 'readonly').objectStore(BRIEFS).openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) {
          resolve();
          return;
        }
        const value = cursor.value as { gist?: string | null; t?: number; v?: number };
        if (value?.v === 2 && typeof value.gist === 'string' && value.gist && typeof value.t === 'number' && Date.now() - value.t < BRIEF_TTL) {
          out.set(String(cursor.key), value.gist);
        }
        cursor.continue();
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    /* First visit. */
  }
  return out;
}

export async function writeAppendixBrief(lemma: string, gist: string | null) {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(BRIEFS, 'readwrite');
      tx.objectStore(BRIEFS).put({ gist, t: Date.now(), v: 2 }, lemma);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* Keep the meaning for this visit only. */
  }
}
