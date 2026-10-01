function wordKey(token: string) {
  return token.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

function keptIndexes(original: string[], correction: string[]) {
  const rows = Array.from({ length: original.length + 1 }, () => new Uint16Array(correction.length + 1));
  for (let i = original.length - 1; i >= 0; i--) for (let j = correction.length - 1; j >= 0; j--)
    rows[i][j] = wordKey(original[i]) === wordKey(correction[j]) && original[i] === correction[j].replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '') ? 1 + rows[i + 1][j + 1] : Math.max(rows[i + 1][j], rows[i][j + 1]);
  const kept = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < original.length && j < correction.length) {
    const sameWord = wordKey(original[i]) === wordKey(correction[j]);
    const sameCase = original[i] === correction[j].replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    if (sameWord && sameCase) { kept.add(i); i++; j++; }
    else if (rows[i + 1][j] >= rows[i][j + 1]) i++;
    else j++;
  }
  return kept;
}

/** Words in the student's sentence that none of the suggestions keep. */
export function mistakeParts(original: string, corrections: string[]) {
  const parts = original.match(/\s+|\S+/g) ?? [original];
  const words = parts.filter((part) => !/^\s+$/.test(part));
  if (!corrections.length || words.length * corrections.join(' ').split(/\s+/).length > 1_000_000) {
    return parts.map((text) => ({ text, wrong: !/^\s+$/.test(text) }));
  }
  const kept = corrections.map((correction) => keptIndexes(words, correction.match(/\S+/g) ?? []));
  let index = 0;
  return parts.map((text) => {
    if (/^\s+$/.test(text)) return { text, wrong: false };
    const at = index++;
    return { text, wrong: !kept.some((set) => set.has(at)) };
  });
}

/** Align words in order so repeated words and insertions highlight accurately. */
export function writingDiff(original: string, correction: string) {
  const before = original.match(/\S+/g) ?? [];
  const after = correction.match(/\s+|\S+/g) ?? [];
  const words = after.filter(token => !/^\s+$/.test(token));
  // Bound quadratic alignment even if future callers exceed the API text limits.
  if(before.length * words.length > 1_000_000) return [{text:correction,changed:original!==correction}];
  const rows = Array.from({length: before.length + 1}, () => new Uint16Array(words.length + 1));
  for (let i = before.length - 1; i >= 0; i--) for (let j = words.length - 1; j >= 0; j--)
    rows[i][j] = before[i] === words[j] ? 1 + rows[i+1][j+1] : Math.max(rows[i+1][j], rows[i][j+1]);
  const unchanged = new Set<number>();
  let i=0, j=0;
  while(i<before.length && j<words.length) {
    if(before[i]===words[j]){unchanged.add(j);i++;j++;}
    else if(rows[i+1][j]>=rows[i][j+1]) i++; else j++;
  }
  let index=0;
  return after.map(text => ({text, changed: /^\s+$/.test(text) ? false : !unchanged.has(index++)}));
}
