import type { Language } from './learner';

const PREFIX = 'em-mt-v2:';
const TTL = 7 * 86_400_000;
const memory = new Map<string, Promise<string | null>>();

/** The word itself in Tamil or Hindi, via the app's server route. Null when unavailable. */
export function motherTongueOf(word: string, lang: Language): Promise<string | null> {
  const clean = word.trim().toLowerCase();
  if (lang === 'en' || !clean) return Promise.resolve(null);
  const key = `${PREFIX}${lang}:${clean}`;
  try {
    const raw = JSON.parse(localStorage.getItem(key) || 'null') as { t: number; v: string | null } | null;
    if (raw?.v && Date.now() - raw.t < TTL) return Promise.resolve(raw.v);
  } catch {}

  let pending = memory.get(key);
  if (!pending) {
    pending = fetch(`/api/translate?word=${encodeURIComponent(clean)}&lang=${lang}`)
      .then(async (res) => {
        if (!res.ok) {
          memory.delete(key);
          return null;
        }
        const v = ((await res.json()) as { text?: string | null }).text ?? null;
        if (!v) { memory.delete(key); return null; }
        try {
          localStorage.setItem(key, JSON.stringify({ t: Date.now(), v }));
        } catch {}
        return v;
      })
      .catch(() => {
        memory.delete(key);
        return null;
      });
    memory.set(key, pending);
  }
  return pending;
}
