import type { DayActivity, StudyWord } from './learner';
import type { WordProgress } from './srs';

const DB = 'em-live-cache';
const STORE = 'live';
const VERSION = 1;

export type LiveCache = {
  words: StudyWord[];
  progress: Record<string, WordProgress>;
  activity: DayActivity[];
  at: number;
};

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

export async function readLiveCache(userId: string): Promise<LiveCache | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(userId);
      req.onsuccess = () => {
        const row = req.result as LiveCache | undefined;
        resolve(row?.words?.length ? row : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function writeLiveCache(userId: string, payload: Omit<LiveCache, 'at'>) {
  try {
    const db = await openDb();
    const row: LiveCache = { ...payload, at: Date.now() };
    await new Promise<void>((resolve, reject) => {
      const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(row, userId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    /* Quota or private mode: keep using the network. */
  }
}

export async function clearLiveCache(userId: string | null) {
  if (!userId) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const req = db.transaction(STORE, 'readwrite').objectStore(STORE).delete(userId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    /* ignore */
  }
}
