import { hyphenateSync } from 'hyphen/en-gb';

/**
 * Split a word with Franklin Liang's TeX hyphenation patterns (British English).
 * The letters stay as written — we only mark where a dictionary would break the word.
 */
export function beatsOf(word: string) {
  const letters = word.match(/[A-Za-z]+(?:'[A-Za-z]+)?/)?.[0] ?? word;
  if (letters.length < 5) return [word];
  const bits = hyphenateSync(letters.toLowerCase()).split('\u00AD').filter(Boolean);
  if (bits.length < 2) return [word];
  let at = 0;
  return bits.map((bit) => {
    const slice = letters.slice(at, at + bit.length);
    at += bit.length;
    return slice || bit;
  });
}
