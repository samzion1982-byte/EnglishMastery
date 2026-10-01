'use client';

import { useEffect, useState } from 'react';
import type { WordEntry } from '@/lib/dictionary';
import type { StudyWord } from '@/lib/learner';
import { entryFor } from '@/lib/word-store';
import { resolveWord } from '@/lib/word-overrides';

export function resolveStudy(word: StudyWord, entry: WordEntry | null | undefined) {
  return resolveWord(entry, word.overrides, {
    pos: word.pos,
    meaning: word.meaning,
    synonym: word.synonym,
    antonym: word.antonym,
    examples: word.examples,
  });
}

/** Saved (or, until saved, live) dictionary data for one word, with the teacher's changes applied. */
export function useWord(word: StudyWord) {
  const [state, setState] = useState<{ lemma: string; entry: WordEntry | null } | null>(null);
  useEffect(() => {
    let live = true;
    void entryFor(word.lemma).then((entry) => {
      if (live) setState({ lemma: word.lemma, entry });
    });
    return () => {
      live = false;
    };
  }, [word.lemma]);
  const entry = state?.lemma === word.lemma ? state.entry : undefined;
  return { word: resolveStudy(word, entry), loading: entry === undefined, entry: entry ?? null };
}
