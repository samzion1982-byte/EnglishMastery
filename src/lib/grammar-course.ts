import type { LiveBucket } from './vocab';
import { GRAMMAR_LESSONS as ORIGINAL_LESSONS, SYLLABUS_UNITS as ORIGINAL_UNITS } from './grammar-catalog';
import { BEGINNER_LESSONS, BEGINNER_UNITS } from './beginner-catalog';
import { BEGINNER_CONTENT_VERSION, type BeginnerResult } from './beginner-learning';
import type { BeginnerLesson } from './beginner-types';

export type GrammarLevelId = LiveBucket;

export type LessonType = 'concept' | 'review' | 'capstone';

export type BlockTone = 'subject' | 'verb' | 'object' | 'extra';

export type Diagram =
  | { kind: 'timeline'; title: string; points: { at: number; label: string; text: string; now?: boolean }[] }
  | { kind: 'blocks'; title: string; parts: { role: string; text: string; tone: BlockTone }[] }
  | { kind: 'flow'; title: string; start: string; yes: { label: string; result: string }; no: { label: string; result: string } }
  | { kind: 'compare'; title: string; left: { label: string; lines: string[] }; right: { label: string; lines: string[] } }
  | { kind: 'icons'; title: string; items: { mark: string; label: string; line: string }[] };

export type Interaction =
  | { kind: 'choice'; prompt: string; options: string[]; answer: number; why: string }
  | { kind: 'tap'; prompt: string; words: string[]; answer: number; why: string }
  | { kind: 'spot'; prompt: string; words: string[]; answer: number; fix: string; why: string }
  | { kind: 'tiles'; prompt: string; tiles: string[]; answer: string[]; why: string }
  | { kind: 'blank'; prompt: string; before: string; after: string; options: string[]; answer: string; why: string };

export type GrammarLesson = {
  id: string;
  level: GrammarLevelId;
  order: number;
  type: LessonType;
  title: string;
  minutes: number;
  summary: string;
  examples: string[];
  diagram: Diagram;
  practice: Interaction[];
  quiz: Interaction[];
  prompt?: string;
  checklist?: string[];
  manuscript?: BeginnerLesson;
};

export type LessonLog = { completedAt: number; score: number; contentVersion?: number; reviewed?: boolean; result?: BeginnerResult };

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  ...BEGINNER_LESSONS.map((lesson, index): GrammarLesson => ({
    id: lesson.id, level: 'beginner', order: index + 1, type: lesson.kind,
    title: lesson.title, minutes: 0,
    summary: lesson.sections[0]?.paragraphs[0] ?? '',
    examples: lesson.sections.find(s => s.title === 'Look at worked examples')?.examples ?? [],
    diagram: { kind: 'blocks', title: 'Learn at your own pace', parts: [] },
    practice: [], quiz: [], manuscript: lesson,
  })),
  ...ORIGINAL_LESSONS.filter(lesson => lesson.level !== 'beginner'),
];
export const SYLLABUS_UNITS = { ...ORIGINAL_UNITS, beginner: BEGINNER_UNITS };

export type LevelProgress = {
  /** Lesson the student was on. Switching levels never overwrites another level's cursor. */
  cursorLessonId: string | null;
  lastCompletedLessonId: string | null;
  log: Record<string, LessonLog>;
  /** null = not asked yet. A recommendation never blocks the level. */
  placement: null | 'skipped' | 'ready' | 'stretch';
};

export type GrammarState = {
  /** null until the student picks a level in the topic modal. */
  chosenLevel: GrammarLevelId | null;
  currentLevel: GrammarLevelId;
  levels: Record<GrammarLevelId, LevelProgress>;
  /** When true, the three-column chooser stays closed. Cleared with browser storage. */
  hideChooser: boolean;
};

/** Legacy Intermediate and Advanced quizzes: 60% requires 3 of 4 correct. */
export const PASS_MARK = 60;

export const GRAMMAR_LEVELS: { id: GrammarLevelId; title: string; note: string; tone: string }[] = [
  { id: 'beginner', title: 'Beginner', note: '', tone: 'teal' },
  { id: 'intermediate', title: 'Intermediate', note: 'Deeper verbs, sentence building, and writing accuracy.', tone: 'violet' },
  { id: 'advanced', title: 'Advanced', note: 'Emphasis, clause relationships, and precise usage.', tone: 'coral' },
];

const KEY = 'em-grammar-v1';

function emptyLevel(): LevelProgress {
  return { cursorLessonId: null, lastCompletedLessonId: null, log: {}, placement: null };
}

export function emptyGrammarState(): GrammarState {
  return {
    chosenLevel: null,
    currentLevel: 'beginner',
    levels: { beginner: emptyLevel(), intermediate: emptyLevel(), advanced: emptyLevel() },
    hideChooser: false,
  };
}

function grammarKey(userId: string | null) {
  return `${KEY}:${userId ?? 'guest'}`;
}

function asLevel(value: unknown): GrammarLevelId {
  return value === 'intermediate' || value === 'advanced' || value === 'beginner' ? value : 'beginner';
}

export function loadGrammar(userId: string | null): GrammarState {
  const fresh = emptyGrammarState();
  try {
    const raw = JSON.parse(localStorage.getItem(grammarKey(userId)) || 'null') as Partial<GrammarState> | null;
    if (!raw || typeof raw !== 'object') return fresh;
    const levels = { ...fresh.levels };
    for (const id of ['beginner', 'intermediate', 'advanced'] as const) {
      const saved = raw.levels?.[id];
      if (!saved || typeof saved !== 'object') continue;
      const log: Record<string, LessonLog> = {};
      if (saved.log && typeof saved.log === 'object') {
        for (const [lessonId, entry] of Object.entries(saved.log)) {
          if (!entry || typeof entry !== 'object') continue;
          const completedAt = Number(entry.completedAt);
          const score = Number(entry.score);
          if (Number.isFinite(completedAt) && Number.isFinite(score)) log[lessonId] = {
            completedAt, score,
            ...(entry.reviewed === true && Number.isInteger(entry.contentVersion) && Number(entry.contentVersion) > 0 ? { reviewed: true, contentVersion: entry.contentVersion } : {}),
          };
        }
      }
      levels[id] = {
        cursorLessonId: typeof saved.cursorLessonId === 'string' ? saved.cursorLessonId : null,
        lastCompletedLessonId: typeof saved.lastCompletedLessonId === 'string' ? saved.lastCompletedLessonId : null,
        log,
        placement: saved.placement === 'skipped' || saved.placement === 'ready' || saved.placement === 'stretch' ? saved.placement : null,
      };
    }
    const currentLevel = asLevel(raw.currentLevel);
    const hasWork = (['beginner', 'intermediate', 'advanced'] as const).some((id) => Object.keys(levels[id].log).length > 0);
    const chosenLevel = raw.chosenLevel === 'beginner' || raw.chosenLevel === 'intermediate' || raw.chosenLevel === 'advanced'
      ? raw.chosenLevel
      : hasWork
        ? currentLevel
        : null;
    return { chosenLevel, currentLevel, levels, hideChooser: raw.hideChooser === true };
  } catch {
    return fresh;
  }
}

export function saveGrammar(userId: string | null, state: GrammarState) {
  try {
    localStorage.setItem(grammarKey(userId), JSON.stringify(state));
    return true;
  } catch {
    /* Progress lasts for this visit if storage is blocked. */
    return false;
  }
}

export function lessonsFor(level: GrammarLevelId) {
  const rank = new Map<string, number>();
  SYLLABUS_UNITS[level].forEach((unit, unitIndex) => {
    unit.lessonIds.forEach((id, index) => rank.set(id, unitIndex * 100 + index));
  });
  return GRAMMAR_LESSONS.filter((lesson) => lesson.level === level).sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999));
}

export function unitFor(lesson: GrammarLesson) {
  return SYLLABUS_UNITS[lesson.level].find((unit) => unit.lessonIds.includes(lesson.id)) ?? SYLLABUS_UNITS[lesson.level][0];
}

export function lessonById(id: string) {
  return GRAMMAR_LESSONS.find((lesson) => lesson.id === id) ?? null;
}

export function isPassed(entry: LessonLog | undefined) {
  return !!entry && entry.score >= PASS_MARK;
}

export function isLessonComplete(lesson: GrammarLesson, entry: LessonLog | undefined) {
  return lesson.manuscript
    ? entry?.reviewed === true && entry.contentVersion === BEGINNER_CONTENT_VERSION
    : isPassed(entry);
}

export function levelStats(level: GrammarLevelId, progress: LevelProgress) {
  const lessons = lessonsFor(level);
  const done = lessons.filter((lesson) => isLessonComplete(lesson, progress.log[lesson.id])).length;
  return { total: lessons.length, done, percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
}

export function cursorFor(level: GrammarLevelId, progress: LevelProgress) {
  const lessons = lessonsFor(level);
  const saved = lessons.find(lesson => lesson.id === progress.cursorLessonId && !isLessonComplete(lesson, progress.log[lesson.id]));
  return saved?.id ?? lessons.find((lesson) => !isLessonComplete(lesson, progress.log[lesson.id]))?.id ?? lessons.at(-1)?.id ?? null;
}

export function earlierLevel(level: GrammarLevelId): GrammarLevelId | null {
  if (level === 'intermediate') return 'beginner';
  if (level === 'advanced') return 'intermediate';
  return null;
}

export function withCursor(state: GrammarState, level: GrammarLevelId, lessonId: string): GrammarState {
  return {
    ...state,
    currentLevel: level,
    levels: {
      ...state.levels,
      [level]: { ...state.levels[level], cursorLessonId: lessonId },
    },
  };
}

export function withPlacement(state: GrammarState, level: GrammarLevelId, placement: LevelProgress['placement']): GrammarState {
  return {
    ...state,
    currentLevel: level,
    levels: {
      ...state.levels,
      [level]: { ...state.levels[level], placement },
    },
  };
}

export function withChoice(state: GrammarState, level: GrammarLevelId): GrammarState {
  return { ...state, chosenLevel: level, currentLevel: level };
}

export function withHideChooser(state: GrammarState, hideChooser: boolean): GrammarState {
  return { ...state, hideChooser };
}

export function withCompletion(state: GrammarState, lesson: GrammarLesson, score: number, at = Date.now()): GrammarState {
  if (score < PASS_MARK) return state;
  const progress = state.levels[lesson.level];
  const lessons = lessonsFor(lesson.level);
  const index = lessons.findIndex((item) => item.id === lesson.id);
  const cursorIndex = lessons.findIndex((item) => item.id === progress.cursorLessonId);
  const ahead = lessons.slice(index + 1).find((item) => !isPassed(progress.log[item.id]));
  const cursorLessonId = index >= cursorIndex ? (ahead?.id ?? lesson.id) : progress.cursorLessonId;
  return {
    ...state,
    currentLevel: lesson.level,
    levels: {
      ...state.levels,
      [lesson.level]: {
        ...progress,
        lastCompletedLessonId: lesson.id,
        cursorLessonId,
        log: { ...progress.log, [lesson.id]: { completedAt: at, score } },
      },
    },
  };
}

export function withReviewedCompletion(state: GrammarState, lesson: GrammarLesson, result: BeginnerResult, at = Date.now()): GrammarState {
  if (!lesson.manuscript) return state;
  const progress = state.levels.beginner;
  const log = { ...progress.log, [lesson.id]: {
    completedAt: at,
    // This is objective-choice accuracy only, never an invented grade for writing.
    score: result.choiceTotal ? scoreOf(result.choiceCorrect, result.choiceTotal) : 0,
    reviewed: true, contentVersion: BEGINNER_CONTENT_VERSION, result,
  } };
  const lessons = lessonsFor('beginner');
  const index = lessons.findIndex(item => item.id === lesson.id);
  const next = [...lessons.slice(index + 1), ...lessons.slice(0, index)].find(item => !isLessonComplete(item, log[item.id]));
  return { ...state, levels: { ...state.levels, beginner: {
    ...progress, log, lastCompletedLessonId: lesson.id, cursorLessonId: next?.id ?? lesson.id,
  } } };
}

export function xpFor(type: LessonType) {
  if (type === 'capstone') return 25;
  if (type === 'review') return 10;
  return 15;
}

export function scoreOf(correct: number, total: number) {
  if (!total) return 100;
  return Math.round((correct / total) * 100);
}
