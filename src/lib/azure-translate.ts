/** Server only: reads the Azure Translator key. */

export type TongueLang = 'ta' | 'hi' | 'ml' | 'te' | 'kn' | 'fr';

export function translatorReady() {
  return !!process.env.AZURE_TRANSLATOR_KEY && !!process.env.AZURE_TRANSLATOR_REGION;
}

/**
 * Translates single English words (never sentences) in one request. A word that comes back unchanged gives null.
 * Throws when the service is not configured, over quota or unreachable.
 */
export async function translateWords(words: string[], lang: TongueLang): Promise<(string | null)[]> {
  const key = process.env.AZURE_TRANSLATOR_KEY;
  const region = process.env.AZURE_TRANSLATOR_REGION;
  if (!key || !region) throw new Error('Translation is not configured.');
  if (!words.length) return [];
  const res = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=${lang}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': key,
      'Ocp-Apim-Subscription-Region': region,
    },
    body: JSON.stringify(words.map((Text) => ({ Text }))),
    signal: AbortSignal.timeout(10000),
  }).catch(() => null);
  if (!res) throw new Error('Microsoft Translator is unreachable.');
  if (res.status === 403 || res.status === 429) throw new Error('Microsoft Translator free quota is used up for now.');
  if (!res.ok) throw new Error(`Microsoft Translator returned ${res.status}.`);
  const body = (await res.json()) as { translations?: { text?: string }[] }[];
  return words.map((word, i) => {
    const text = body[i]?.translations?.[0]?.text?.trim() ?? '';
    return text && text.toLowerCase() !== word.toLowerCase() ? text : null;
  });
}
