import type { TongueLang } from './azure-translate';

const NAMES: Record<TongueLang, string> = {
  ta: 'Tamil',
  hi: 'Hindi',
  ml: 'Malayalam',
  te: 'Telugu',
  kn: 'Kannada',
  fr: 'French',
};

/**
 * Used only for words Microsoft Translator left blank.
 * MyMemory first, then Google's public translate endpoint, then Groq for whatever is still blank.
 */
export async function translateFallback(words: string[], lang: TongueLang): Promise<(string | null)[]> {
  const out = await mapWords(words, (word) => fromMyMemory(word, lang));
  await fillGaps(out, words, (word) => fromGoogle(word, lang));
  await fillWithGroq(out, words, lang);
  return out;
}

async function fillGaps(out: (string | null)[], words: string[], lookup: (word: string) => Promise<string | null>) {
  const pending = out.flatMap((text, index) => (text ? [] : [index]));
  if (!pending.length) return;
  const found = await mapWords(pending.map((index) => words[index]), lookup);
  pending.forEach((index, slot) => {
    if (found[slot]) out[index] = found[slot];
  });
}

async function mapWords(words: string[], lookup: (word: string) => Promise<string | null>) {
  const out: (string | null)[] = words.map(() => null);
  const queue = words.map((word, index) => ({ word, index }));
  async function worker() {
    for (let next = queue.shift(); next; next = queue.shift()) out[next.index] = await lookup(next.word);
  }
  await Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker));
  return out;
}

function keep(word: string, text: string) {
  const clean = text.trim();
  if (!clean || /MYMEMORY WARNING/i.test(clean) || clean.toLowerCase() === word.toLowerCase()) return null;
  return clean;
}

async function fromMyMemory(word: string, lang: TongueLang) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${encodeURIComponent(`en|${lang}`)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) }).catch(() => null);
  if (!res?.ok) return null;
  const body = (await res.json().catch(() => null)) as { responseData?: { translatedText?: string } } | null;
  return keep(word, body?.responseData?.translatedText ?? '');
}

async function fromGoogle(word: string, lang: TongueLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(word)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) }).catch(() => null);
  if (!res?.ok) return null;
  const body = (await res.json().catch(() => null)) as [Array<[string]>?];
  return keep(word, body?.[0]?.[0]?.[0] ?? '');
}

async function fillWithGroq(out: (string | null)[], words: string[], lang: TongueLang) {
  const pending = out.flatMap((text, index) => (text ? [] : [{ id: index, word: words[index] }]));
  const key = process.env.GROQ_API_KEY;
  if (!pending.length || !key) return;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      model: process.env.GROQ_TRANSLATE_MODEL || 'llama-3.1-8b-instant',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `Translate each English word into ${NAMES[lang]}. Reply with JSON {"translations":[{"id":number,"text":string}]}. Use ${NAMES[lang]} script. Transliterate names. No English spelling, no notes.`,
        },
        { role: 'user', content: JSON.stringify({ words: pending }) },
      ],
      response_format: { type: 'json_object' },
    }),
  }).catch(() => null);
  if (!response?.ok) return;
  const body = (await response.json().catch(() => null)) as { choices?: { message?: { content?: string } }[] } | null;
  let parsed: { translations?: { id?: number; text?: string }[] } = {};
  try { parsed = JSON.parse(body?.choices?.[0]?.message?.content || '{}'); } catch { return; }
  for (const row of parsed.translations ?? []) {
    if (typeof row.id !== 'number' || !pending.some((item) => item.id === row.id)) continue;
    const text = keep(words[row.id], row.text ?? '');
    if (text) out[row.id] = text;
  }
}
