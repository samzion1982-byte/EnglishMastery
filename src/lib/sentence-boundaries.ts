/** UTF-16 offsets match JavaScript strings and DOM text ranges. */
export type SentenceSpan = { text: string; start: number; end: number };
const abbreviations = new Set(['mr','mrs','ms','dr','prof','st','jr','sr','vs','etc','no','vol','fig','ave','blvd','dept','gen','col','capt','sgt','rev','approx','inc','ltd']);

export function endsSentence(text: string, index: number): boolean {
  const mark = text[index];
  if (!'.!?'.includes(mark ?? '') || !mark) return false;
  // A quotation can end inside a sentence: “Go!” she shouted. Abstain at that boundary.
  if (/^["'”’]+\s+[a-z]/.test(text.slice(index+1))) return false;
  if (mark !== '.') return true;
  // Decimal points, initials, dotted abbreviations, email and URL interiors.
  if (/\d/.test(text[index-1] ?? '') && /\d/.test(text[index+1] ?? '')) return false;
  if (/[\p{L}\p{N}]/u.test(text[index+1] ?? '')) return false;
  const token = text.slice(0,index).match(/([A-Za-z]+)$/)?.[1];
  if (token && (abbreviations.has(token.toLowerCase()) || /^[A-Za-z]$/.test(token))) return false;
  // Ellipses may be hesitation, not a sentence break. Conservatively abstain.
  if (text[index-1] === '.' || text[index+1] === '.') return false;
  return true;
}

export function splitSentences(text: string): SentenceSpan[] {
  const spans: SentenceSpan[] = [];
  let start = 0;
  const push = (end: number) => {
    while (start < end && /\s/.test(text[start])) start++;
    let trimmedEnd = end;
    while (trimmedEnd > start && /\s/.test(text[trimmedEnd-1])) trimmedEnd--;
    if (trimmedEnd > start) spans.push({text:text.slice(start,trimmedEnd),start,end:trimmedEnd});
    start = end;
  };
  for (let i=0;i<text.length;i++) {
    if (!endsSentence(text,i)) continue;
    let end=i+1;
    while (end<text.length && /[.!?"'”’)]/.test(text[end])) end++;
    // Punctuation embedded in a token is not a supported sentence boundary.
    if (end<text.length && !/\s/.test(text[end])) continue;
    push(end); i=end-1;
  }
  push(text.length);
  return spans;
}
