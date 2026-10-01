import { classifyLemma, VOCAB_SORT_RUBRIC } from './classify';
import { displayWord, lemmaOf, type LiveBucket } from './vocab';

export type SortAssignment = {
  word: string;
  lemma: string;
  bucket: LiveBucket;
  confidence: number;
  reason: string;
  doubt: boolean;
};
export type SortProvider = 'local';

export { VOCAB_SORT_RUBRIC };

/** Fast local sort using the shared teen CEFR rubric (same rules previously sent to Groq). */
export function sortWordsLocal(words: string[]): {
  assignments: SortAssignment[];
  provider: SortProvider;
  localCount: number;
  aiCount: number;
  doubtCount: number;
} {
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const raw of words) {
    const word = displayWord(raw);
    const lemma = lemmaOf(word);
    if (!lemma || seen.has(lemma)) continue;
    seen.add(lemma);
    unique.push(word);
  }

  const assignments = unique.map((word) => {
    const lemma = lemmaOf(word);
    const result = classifyLemma(word);
    return {
      word,
      lemma,
      bucket: result.bucket,
      confidence: result.confidence,
      reason: result.reason,
      doubt: result.doubt,
    };
  });

  return {
    assignments,
    provider: 'local',
    localCount: unique.length,
    aiCount: 0,
    doubtCount: assignments.filter((a) => a.doubt).length,
  };
}

export function availableAiProvider(): SortProvider {
  return 'local';
}

/** Kept for the existing API route; always local (no Groq). */
export async function sortWordsWithAi(words: string[]) {
  return sortWordsLocal(words);
}
