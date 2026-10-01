import type { LiveBucket } from './vocab';
import { lemmaOf } from './vocab';
import {
  ADVANCED_LIST,
  BEGINNER_LIST,
  EVERYDAY_FORCE_BEGINNER,
  INTERMEDIATE_LIST,
  SCHOOL_ATION,
  SCHOOL_FORCE_INTERMEDIATE,
} from './classify-lists';

/**
 * Teen CEFR-style sorting rules for Core Vocabulary.
 * Local sorter applies these rules directly (no external AI).
 */
export const VOCAB_SORT_RUBRIC = `Sort each English headword for teenage learners (ages 12–17) into exactly one bucket:

beginner — everyday home/school English a lower-secondary student already meets: common nouns/verbs, basic feelings and personality words (happy, kind, friendly, patient, selfish, unreliable), short everyday adjectives. NOT rare literary or medical words.

intermediate — school / essay English (roughly B1–B2): collaborate, resilient, opportunity, responsible, analyse, persuade, environment, strategy. Clear but not rare.

advanced — rare, academic, or literary words (roughly C1+): emaciated, meticulous, ubiquitous, juxtaposition, ephemeral, pragmatic, idiosyncrasy. Low-frequency Latinate vocabulary.

When unsure between beginner and intermediate, prefer intermediate for abstract school words; when unsure between intermediate and advanced, prefer advanced only if the word is uncommon in everyday teen speech.
Short length alone never makes a word beginner — many GRE lemmas are short (abate, arcane, lucid).`;

export type ClassifyResult = {
  bucket: LiveBucket;
  confidence: number;
  reason: string;
  doubt: boolean;
};

const VOWELS = /[aeiouy]+/g;

/** True rare academic endings — do NOT include -icious (delicious, suspicious, precious). */
const RARE_ACADEMIC_ENDING =
  /ology$|ography$|ophobia$|escence$|iferous$|ectomy$|iasis$|aceous$|itious$/;

const LITERARY_SHAPE = /(?:iated|ulous|escent|acious|aneous|esque)$/;

/** Everyday Anglo-ish stems that make -ful/-less/-ish/-ly beginner-safe. */
const EVERYDAY_STEM =
  /^(help|care|hope|fear|pain|use|use|peace|friend|self|home|school|play|work|rest|thank|thought|beauty|wonder|power|color|colour|harm|harm|end|aim|joy|fun|sun|rain|cloud|week|year|day|night|room|class|home|soft|hard|quick|slow|loud|quiet|kind|nice|rude|lazy|busy|sick|safe|dark|light|heavy|empty|full|clean|dirty|sweet|bitter|brave|calm|weak|strong|rich|poor|true|false|right|wrong|near|far|tall|short|long|wide|deep|warm|cool|cold|hot|wet|dry|thick|thin|open|close|break|fix|start|finish|learn|teach|read|write|speak|listen|watch|look|feel|think|know|want|need|like|love|hate|fear|worry|smile|laugh|cry|shout|jump|walk|run|sit|stand|sleep|eat|drink|buy|sell|pay|give|take|make|come|go|find|show|tell|keep|try|win|lose)$/;

function syllableEstimate(lemma: string) {
  const clean = lemma.replace(/[^a-z]/g, '');
  if (!clean) return 1;
  const groups = clean.match(VOWELS);
  let n = groups ? groups.length : 1;
  if (clean.endsWith('e') && n > 1) n -= 1;
  if (clean.endsWith('le') && clean.length > 2 && !/[aeiouy]/.test(clean.at(-3) || '')) n += 1;
  return Math.max(1, n);
}

/** Strong Latinate clusters that signal academic vocabulary (not every "ct"). */
function hasStrongLatinate(lemma: string) {
  return /ph|scru|ction|sion|xious|tial|cial|gious|eous|uous|chr|rh|pse|mn|qu[aeiou]/.test(lemma);
}

function scoreBucket(lemma: string): { bucket: LiveBucket; score: number; reason: string; weak: boolean } {
  const len = lemma.length;
  const syllables = syllableEstimate(lemma);
  const latinate = hasStrongLatinate(lemma);
  let beginner = 0;
  let intermediate = 0;
  let advanced = 0;
  const reasons: string[] = [];

  if (SCHOOL_ATION.has(lemma)) {
    intermediate += 10;
    reasons.push('common school -tion');
  }

  /* Shape signals — never boost Beginner from length/syllables alone. */
  if (RARE_ACADEMIC_ENDING.test(lemma) && len >= 8) {
    advanced += 10;
    reasons.push('rare academic ending');
  } else if (LITERARY_SHAPE.test(lemma) && len >= 9) {
    advanced += 9;
    reasons.push('literary/derived shape');
  } else if (/tion$|sion$/.test(lemma)) {
    if (SCHOOL_ATION.has(lemma) || len <= 11) {
      intermediate += 8;
      reasons.push('school -tion/-sion');
    } else {
      intermediate += 5;
      advanced += 3;
      reasons.push('long -tion/-sion');
    }
  } else if (/ment$|ness$|ence$|ance$|ism$|ity$|ible$|able$|ous$|ive$|ize$|ise$|ify$/.test(lemma)) {
    if (len >= 12) {
      intermediate += 7;
      advanced += 2;
      reasons.push('long derived form');
    } else if (len >= 8) {
      intermediate += 7;
      reasons.push('school derived form');
    } else {
      intermediate += 4;
      reasons.push('short derived form');
    }
  } else if (/(?:ful|less|ish|ly)$/.test(lemma)) {
    const stem = lemma.replace(/(?:ful|less|ish|ly)$/, '');
    if (stem.length <= 6 && EVERYDAY_STEM.test(stem)) {
      beginner += 8;
      reasons.push('everyday adjective/adverb');
    } else if (stem.length <= 5 && len <= 9 && !latinate) {
      beginner += 4;
      intermediate += 3;
      reasons.push('short affix form');
    } else {
      intermediate += 5;
      reasons.push('longer affix form');
    }
  } else if (/y$/.test(lemma) && len <= 6 && !latinate) {
    beginner += 3;
    intermediate += 2;
    reasons.push('short -y form');
  }

  if (/^(un|dis|mis|non|re|pre|over|under|inter|trans|super|anti)/.test(lemma)) {
    if (len <= 9 && /^(un|dis)/.test(lemma) && /(?:y|ly|ful|less|ed|ing|able|ible)$/.test(lemma)) {
      beginner += 5;
      reasons.push('common negative everyday form');
    } else if (len <= 12) {
      intermediate += 5;
      reasons.push('prefixed school form');
    } else {
      intermediate += 4;
      advanced += 2;
      reasons.push('long prefixed form');
    }
  }

  /* Syllables: many syllables → school band by default, not auto-Advanced. */
  if (syllables >= 5 || (syllables >= 4 && len >= 12)) {
    intermediate += 5;
    if (latinate) advanced += 2;
    reasons.push('many syllables');
  } else if (syllables >= 3) {
    intermediate += 4;
    reasons.push('polysyllable');
  } else if (syllables === 2 && len >= 7) {
    intermediate += 2;
    reasons.push('compact two syllables');
  }
  /* monosyllables / short two-syllable words: no beginner boost — lists decide */

  if (latinate && len >= 10) {
    intermediate += 3;
    advanced += 2;
    reasons.push('latinate cluster');
  }

  if (len >= 12) {
    intermediate += 3;
    advanced += 2;
  } else if (len >= 9) {
    intermediate += 2;
  }

  /* Latinate -ate verbs that are not in advanced list → intermediate (school essay). */
  if (/ate$/.test(lemma) && len >= 7 && len <= 11 && !ADVANCED_LIST.has(lemma)) {
    intermediate += 4;
    reasons.push('school -ate verb shape');
  }

  const weak = reasons.length === 0 || (beginner === 0 && intermediate <= 2 && advanced === 0);

  /* Prefer advanced only with a clear margin over school bands. */
  if (advanced >= 8 && advanced >= intermediate + 3 && advanced > beginner) {
    return {
      bucket: 'advanced',
      score: Math.min(90, 58 + advanced * 3),
      reason: reasons.join(' · ') || 'advanced signals',
      weak: false,
    };
  }

  /* Beginner only when everyday-affix / negative signals actually fired. */
  if (beginner >= 6 && beginner >= intermediate + 2 && beginner > advanced) {
    return {
      bucket: 'beginner',
      score: Math.min(88, 56 + beginner * 3),
      reason: reasons.join(' · ') || 'beginner signals',
      weak: false,
    };
  }

  if (intermediate >= advanced && intermediate > 0) {
    return {
      bucket: 'intermediate',
      score: Math.min(86, 54 + Math.max(intermediate, 3) * 3),
      reason: reasons.join(' · ') || 'intermediate signals',
      weak,
    };
  }

  if (advanced > intermediate) {
    return {
      bucket: 'advanced',
      score: Math.min(84, 52 + advanced * 3),
      reason: reasons.join(' · ') || 'advanced lean',
      weak: false,
    };
  }

  /* Bare short home-English (melt, knife, cook). Rare GRE shorts are on ADVANCED_LIST. */
  if (syllables <= 1 && len <= 5 && !latinate) {
    return {
      bucket: 'beginner',
      score: 74,
      reason: 'short everyday word',
      weak: false,
    };
  }

  /* Unknown longer lemmas default to Intermediate — safer for teens than Beginner. */
  return {
    bucket: 'intermediate',
    score: 58,
    reason: 'default school-level placement',
    weak: true,
  };
}

function listHit(lemma: string): ClassifyResult | null {
  const inBeginner = BEGINNER_LIST.has(lemma);
  const inIntermediate = INTERMEDIATE_LIST.has(lemma);
  const inAdvanced = ADVANCED_LIST.has(lemma);
  const hits = [inBeginner, inIntermediate, inAdvanced].filter(Boolean).length;

  if (hits === 1) {
    const bucket: LiveBucket = inAdvanced ? 'advanced' : inIntermediate ? 'intermediate' : 'beginner';
    return { bucket, confidence: 96, reason: `Matched ${bucket} reference list`, doubt: false };
  }

  if (hits > 1) {
    /* Prefer the lowest band on conflict — advanced must not steal school/everyday words. */
    const bucket: LiveBucket = inBeginner ? 'beginner' : inIntermediate ? 'intermediate' : 'advanced';
    return {
      bucket,
      confidence: 78,
      reason: 'Multi-list — preferred lower school band',
      doubt: false,
    };
  }

  return null;
}

export function classifyLemma(raw: string): ClassifyResult {
  const lemma = lemmaOf(raw);
  if (!lemma) {
    return { bucket: 'beginner', confidence: 0, reason: 'Empty', doubt: true };
  }

  const fromList = listHit(lemma);
  if (fromList) return fromList;

  if (EVERYDAY_FORCE_BEGINNER.has(lemma)) {
    return { bucket: 'beginner', confidence: 94, reason: 'Everyday force beginner', doubt: false };
  }

  if (SCHOOL_FORCE_INTERMEDIATE.has(lemma) || SCHOOL_ATION.has(lemma)) {
    return {
      bucket: 'intermediate',
      confidence: 92,
      reason: SCHOOL_ATION.has(lemma) ? 'Common school -tion word' : 'School force intermediate',
      doubt: false,
    };
  }

  const guess = scoreBucket(lemma);
  /* Queue only truly thin guesses — unknown words still file as Intermediate by default. */
  const doubt = guess.weak && guess.score < 56;

  return {
    bucket: guess.bucket,
    confidence: guess.score,
    reason: guess.reason,
    doubt,
  };
}
