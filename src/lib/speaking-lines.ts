export type SpeakVocab = { id: string; word: string; lemma: string; bucket: string };
export type SpeakKeyword = { id: string; word: string };
export type SpeakPassage = { level: number; text: string; keywords: SpeakKeyword[]; fresh: boolean };

export const SPEAK_LEVELS = 5;
const KEYWORD_COUNT = 5;

/** Complete stories, never arbitrary vocabulary inserted into grammatical slots. */
// Difficulty rises from consonant clusters to longer words and connected instructions.
const PASSAGES = [
  {
    text: 'After lunch Kim walked through the park with her brother. They crossed a narrow bridge above a stream. Low branches hung over the path, so they moved carefully. On the other side, they stopped to watch a small bird build its nest.',
    keywords: ['through', 'narrow', 'bridge', 'branches', 'carefully'],
  },
  {
    text: 'The market was crowded when Ben arrived with his aunt. They chose fresh vegetables for dinner and waited behind another customer. Ben counted the change while his aunt checked the receipt. Before leaving, they packed the tomatoes on top so they would not get crushed.',
    keywords: ['crowded', 'vegetables', 'customer', 'change', 'receipt'],
  },
  {
    text: 'During their walk, Tia and her sister noticed a sudden change in the weather. They heard thunder and hurried towards a nearby shelter. The path was slippery, so they took short steps. At the entrance, they shook the rain from their coats and waited for the storm to pass.',
    keywords: ['weather', 'thunder', 'shelter', 'slippery', 'entrance'],
  },
  {
    text: 'For a science experiment, Omar placed two cups of water near the classroom window. His task was to measure the temperature every ten minutes and compare the results. One cup stood in sunlight while the other stayed in shade. Later, he used his notes to explain what had changed.',
    keywords: ['experiment', 'measure', 'temperature', 'compare', 'explain'],
  },
  {
    text: 'Before the school trip, Lila accepted responsibility for checking the first aid equipment. She read the instructions twice and asked what to do in an emergency. Her teacher explained that everyone should stay calm and follow the group leader. Careful preparation and cooperation would help the class travel safely.',
    keywords: ['responsibility', 'equipment', 'instructions', 'emergency', 'cooperation'],
  },
];

export type SpeakWord = { text: string; hit: boolean };
export type SpeakMatch = { words: SpeakWord[]; heard: string; matched: number; total: number };
export type SpeakMedalName = 'Gold' | 'Silver' | 'Bronze' | 'Keep going';
export type SpeakAward = { medal: SpeakMedalName; total: number; max: number; line: string };

const MEDAL_RANK: Record<SpeakMedalName, number> = { 'Keep going': 0, Bronze: 1, Silver: 2, Gold: 3 };

const WORD = /[A-Za-z0-9]+(?:['’][A-Za-z]+)?/g;

/** Whisper often drops the apostrophe. The sound is the same, so the word still counts. */
const FOLDS: Record<string, string> = {
  dont: "don't",
  cant: "can't",
  wont: "won't",
  im: "i'm",
  ive: "i've",
  youre: "you're",
  theyre: "they're",
  isnt: "isn't",
  wasnt: "wasn't",
  didnt: "didn't",
  thats: "that's",
  theres: "there's",
  lets: "let's",
};

const HALLUCINATION = /^(thanks for watching\.?|thank you for watching\.?|thank you\.?|subtitles by( the amara\.org community)?|you)$/i;

export function targetWords(text: string) {
  return [...text.matchAll(WORD)].map((match) => match[0].replace(/’/g, "'"));
}

function usable(word: SpeakVocab) {
  return word.bucket === 'beginner' && /^[a-z][a-z'-]{2,24}$/.test(word.lemma);
}

function shuffle<T>(items: T[], random: () => number) {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

/** Each story has five hidden keywords. Score those words only, never random story glue like “after” or “she”. */
export function beginnerLevels(words: SpeakVocab[], learnedIds: ReadonlySet<string>, random: () => number = Math.random): SpeakPassage[] {
  const byKey = new Map<string, SpeakVocab>();
  for (const word of words.filter(usable)) {
    const key = keyOf(word.word.trim());
    if (!byKey.has(key)) byKey.set(key, word);
  }
  return PASSAGES.map((passage, index) => {
    const picked = shuffle(passage.keywords.slice(), random).map((label) => {
      const key = keyOf(label);
      return byKey.get(key) ?? { id: `speak-${key}`, word: key, lemma: key, bucket: 'beginner' };
    });
    return {
      level: index + 1,
      text: passage.text,
      fresh: picked.every((word) => !learnedIds.has(word.id)),
      keywords: picked.map((word) => ({ id: word.id, word: keyOf(word.word.trim()) })),
    };
  });
}

export function keywordsInPassage(passage: string, keywords: string[]) {
  const present = new Set(targetWords(passage).map(keyOf));
  return keywords.length >= KEYWORD_COUNT && keywords.every((word) => present.has(keyOf(word)));
}

function takeKeyword(pool: string[], want: string) {
  const at = pool.indexOf(want);
  if (at >= 0) {
    pool[at] = '';
    return true;
  }
  // Whisper often splits compounds: “note book” for notebook.
  for (let index = 0; index < pool.length - 1; index += 1) {
    if (pool[index] && pool[index + 1] && pool[index] + pool[index + 1] === want) {
      pool[index] = '';
      pool[index + 1] = '';
      return true;
    }
  }
  return false;
}

/** Score is how many keywords were heard, once each. */
export function keywordScore(keywords: string[], heard: string) {
  const pool = targetWords(cleanHeard(heard)).map(keyOf);
  const words = keywords.map((word) => ({ word, hit: takeKeyword(pool, keyOf(word)) }));
  return { words, matched: words.filter((item) => item.hit).length, total: words.length };
}

/** Ordered passage coverage; insertions/repetitions never reuse a spoken token. */
export function passageCoverage(target: string, heard: string) {
  const expected = targetWords(target).map(keyOf);
  const spoken = targetWords(cleanHeard(heard)).map(keyOf);
  const rows = Array.from({ length: expected.length + 1 }, () => new Uint16Array(spoken.length + 1));
  for (let i = 1; i <= expected.length; i += 1) {
    for (let j = 1; j <= spoken.length; j += 1) {
      let best = Math.max(rows[i - 1][j], rows[i][j - 1]);
      if (closeEnough(spoken[j - 1], expected[i - 1])) best = Math.max(best, rows[i - 1][j - 1] + 1);
      if (j >= 2 && spoken[j - 2] + spoken[j - 1] === expected[i - 1]) best = Math.max(best, rows[i - 1][j - 2] + 1);
      if (i >= 2 && expected[i - 2] + expected[i - 1] === spoken[j - 1]) best = Math.max(best, rows[i - 2][j - 1] + 2);
      rows[i][j] = best;
    }
  }
  const matched = rows[expected.length][spoken.length];
  return { matched, total: expected.length, incomplete: matched / Math.max(1, expected.length) < 0.7 };
}

export type PassageToken = { text: string; word: boolean; hit: boolean; keyword: boolean; next: boolean };

/** Passage pieces for the reading modal. Heard words stay lit. The next keyword is the one to say. */
export function paintPassage(text: string, heard: string, keywords: string[]): PassageToken[] {
  const match = matchSpeech(text, heard);
  const keys = new Set(keywords.map(keyOf));
  let index = 0;
  let markedNext = false;
  return text.split(/([A-Za-z0-9]+(?:['’][A-Za-z]+)?)/).filter((part) => part !== '').map((part) => {
    if (!/^[A-Za-z0-9]/.test(part)) return { text: part, word: false, hit: false, keyword: false, next: false };
    const hit = !!match.words[index]?.hit;
    const keyword = keys.has(keyOf(part));
    index += 1;
    const next = keyword && !hit && !markedNext;
    if (next) markedNext = true;
    return { text: part, word: true, hit, keyword, next };
  });
}

/** Light the first `lit` words of the passage. Keywords stay unmarked; they are scored later. */
export function paintFollow(text: string, lit: number): PassageToken[] {
  const limit = Math.max(0, Math.floor(lit));
  let index = 0;
  return text.split(/([A-Za-z0-9]+(?:['’][A-Za-z]+)?)/).filter((part) => part !== '').map((part) => {
    if (!/^[A-Za-z0-9]/.test(part)) return { text: part, word: false, hit: false, keyword: false, next: false };
    index += 1;
    return { text: part, word: true, hit: index <= limit, keyword: false, next: false };
  });
}

const FILLER = new Set(['um', 'uh', 'er', 'ah', 'hmm', 'mm', 'uhm']);

function closeEnough(got: string, want: string) {
  if (got === want) return true;
  if (want.length <= 3 || got.length <= 3) return false;
  if ((got === 'practiced' && want === 'practised') || (got === 'practised' && want === 'practiced')) return true;
  return false;
}

/** Follow reading, recovering over at most two missed words with a two-word anchor.
 * Hidden keywords never block the next ordinary word. Official scoring is independent.
 */
export function followTranscript(text: string, transcript: string, start = 0, keywords: string[] = [], heardIndices?: Set<number>) {
  const expected = targetWords(text).map(keyOf);
  const skip = new Set(keywords.map(keyOf));
  const spoken = targetWords(transcript).map(keyOf).filter((word) => !FILLER.has(word));
  let position = Math.max(0, Math.min(expected.length, start));
  for (let index = 0; index < spoken.length && position < expected.length; index += 1) {
    const word = spoken[index];
    if (closeEnough(word, expected[position])) {
      heardIndices?.add(position);
      position += 1;
      continue;
    }
    let look = position;
    while (look < expected.length && skip.has(expected[look])) look += 1;
    if (look > position && look < expected.length && closeEnough(word, expected[look])) {
      heardIndices?.add(look);
      position = look + 1;
      continue;
    }
    // Recognizers sometimes split compounds: "note book" / "notebook".
    if (spoken[index + 1] && word + spoken[index + 1] === expected[position]) {
      heardIndices?.add(position);
      position += 1;
      index += 1;
      continue;
    }
    if (expected[position + 1] && word === expected[position] + expected[position + 1]) {
      heardIndices?.add(position);
      heardIndices?.add(position + 1);
      position += 2;
      continue;
    }
    // Keep the first-word anchor. Never jump across sentences to a common word.
    if (position === 0) continue;
    let recovered = false;
    for (let gap = 1; gap <= 2 && position + gap + 1 < expected.length; gap += 1) {
      const at = position + gap;
      if (word === expected[at] && spoken[index + 1] === expected[at + 1]) {
        heardIndices?.add(at);
        heardIndices?.add(at + 1);
        position = at + 2;
        recovered = true;
        index += 1;
        break;
      }
    }
    if (recovered) continue;
    // A lost phrase must not strand the rest of a paragraph. Require a unique,
    // exact THREE-word anchor for longer recovery, never an isolated common word.
    const anchors: number[] = [];
    if (index + 2 < spoken.length) {
      for (let at = position + 3; at + 2 < expected.length; at += 1) {
        if (expected[at] === word && expected[at + 1] === spoken[index + 1] && expected[at + 2] === spoken[index + 2]
          && expected.slice(at, at + 3).some((part) => part.length >= 4)) anchors.push(at);
      }
    }
    if (anchors.length === 1) {
      const at = anchors[0];
      heardIndices?.add(at);
      heardIndices?.add(at + 1);
      heardIndices?.add(at + 2);
      position = at + 3;
      index += 2;
    }
  }
  return position;
}

function keyOf(word: string) {
  const lower = word.toLowerCase().replace(/’/g, "'");
  return FOLDS[lower] ?? lower;
}

export function cleanHeard(text: string) {
  return text.replace(/\s+/g, ' ').trim().slice(0, 12000);
}

/**
 * Which target words showed up in the transcript.
 * Extra words such as "um" are ignored. A word still counts if it arrives out of order.
 * Repeated words only count as many times as they were said.
 */
export function matchSpeech(target: string, heard: string): SpeakMatch {
  const expected = targetWords(target);
  const pool = targetWords(cleanHeard(heard)).map(keyOf);
  const words = expected.map((text) => {
    const at = pool.indexOf(keyOf(text));
    if (at < 0) return { text, hit: false };
    pool.splice(at, 1);
    return { text, hit: true };
  });
  return { words, heard: cleanHeard(heard), matched: words.filter((word) => word.hit).length, total: words.length };
}

/** Quiet audio and Whisper's stock silence lines are not a failed sentence. */
export function isSilentTake(target: string, heard: string, noSpeechProb: number) {
  const clean = cleanHeard(heard);
  if (matchSpeech(target, clean).matched > 0) return false;
  if (!clean || noSpeechProb >= 0.55 || HALLUCINATION.test(clean)) return true;
  return false;
}

export function speakMedal(total: number, max: number): SpeakAward {
  const safeMax = Math.max(1, max);
  if (safeMax <= 8) {
    if (total >= safeMax) return { medal: 'Gold', total, max: safeMax, line: 'Every keyword landed.' };
    if (total >= safeMax - 1) return { medal: 'Silver', total, max: safeMax, line: 'One keyword still to say clearly.' };
    if (total >= Math.ceil(safeMax * 0.6)) return { medal: 'Bronze', total, max: safeMax, line: 'A good start. Say the new words again.' };
    return { medal: 'Keep going', total, max: safeMax, line: 'Read the passage again. The keywords are waiting.' };
  }
  if (total >= safeMax - 2) return { medal: 'Gold', total, max: safeMax, line: 'Clear speaking. Almost every word landed.' };
  if (total >= Math.round(safeMax * 0.72)) return { medal: 'Silver', total, max: safeMax, line: 'Strong speaking. A few words to try again.' };
  if (total >= Math.round(safeMax * 0.52)) return { medal: 'Bronze', total, max: safeMax, line: 'Good start. Say the lines once more and the medal will rise.' };
  return { medal: 'Keep going', total, max: safeMax, line: 'Say the lines again. The medal is waiting.' };
}

export function readSpeakAward(level: string): SpeakAward | null {
  const store = typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
  if (!store) return null;
  try {
    const raw = store.getItem(`em-speak-medal:${level}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SpeakAward;
    if (!parsed || typeof parsed.total !== 'number' || !(parsed.medal in MEDAL_RANK)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSpeakAward(level: string, total: number, max: number) {
  const store = typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
  const next = speakMedal(total, max);
  if (!store) return next;
  const prev = readSpeakAward(level);
  const better = !prev
    || MEDAL_RANK[next.medal] > MEDAL_RANK[prev.medal]
    || (next.medal === prev.medal && next.total >= prev.total);
  const kept = better ? next : prev;
  store.setItem(`em-speak-medal:${level}`, JSON.stringify(kept));
  return kept;
}

