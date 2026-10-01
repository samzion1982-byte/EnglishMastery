import type { BeginnerLesson, BeginnerTask, BeginnerVideo, BeginnerVisualGuide } from './beginner-types';

export const BEGINNER_CONTENT_VERSION = 2;
export type BeginnerAnswer = { value: string; submitted: boolean; reviewed: boolean; needsPractice: boolean; revision: string };
export type BeginnerAttempt = {
  version: number;
  stepId: string;
  read: string[];
  answers: Record<string, BeginnerAnswer>;
  finishedAt: number | null;
  videoRoute: 'watched' | 'recap' | null;
};
export type BeginnerResult = { choiceCorrect: number; choiceTotal: number; reviewedResponses: number; revisit: string[] };
export type BeginnerStep =
  | { id: string; stage: 'Learn' | 'Write'; kind: 'read'; title: string; paragraphs: string[]; examples: string[]; card?: boolean; goal?: string }
  | { id: string; stage: 'Learn'; kind: 'visual'; guide?: BeginnerVisualGuide }
  | ({ id: string; stage: 'Watch'; kind: 'video' } & BeginnerVideo)
  | { id: string; stage: 'Practise' | 'Quiz' | 'Write'; kind: 'task'; task: BeginnerTask }
  | { id: string; stage: 'Review'; kind: 'summary' };

const proseTitles = new Set(['What you will learn', 'Learn step by step', 'Look at worked examples', 'Important Instruction', 'Try without looking back', 'Part one Check your understanding', 'Part two Write your own paragraph']);

export function beginnerSteps(lesson: BeginnerLesson): BeginnerStep[] {
  const steps: BeginnerStep[] = [];
  const goal = lesson.sections.find(section => section.title === 'What you will learn')?.paragraphs.join(' ');
  const writingIntro = lesson.sections.find(section => section.title === 'Part two Write your own paragraph');
  lesson.sections.forEach((section, index) => {
    if (section.title === 'What you will learn' || section.title === 'Part two Write your own paragraph') return;
    if ((lesson.tasks.length ? ['Remember', 'Check your paragraph', 'Choose your next practice'] : ['Check your paragraph', 'Choose your next practice']).includes(section.title)) return;
    if (section.title === 'Look at worked examples' && (lesson.visual || lesson.visualGuide)) return;
    if (section.title === 'Important Instruction' || !proseTitles.has(section.title)) {
      steps.push({ id: `read-${index}-0`, stage: 'Learn', kind: 'read', title: section.title, paragraphs: section.paragraphs, examples: section.examples, card: section.title !== 'Important Instruction' });
      return;
    }
    for (let i = 0; i < section.paragraphs.length; i += 2) {
      steps.push({ id: `read-${index}-${i}`, stage: 'Learn', kind: 'read', title: section.title, paragraphs: section.paragraphs.slice(i, i + 2), examples: [] });
    }
    if (section.examples.length) steps.push({ id: `examples-${index}`, stage: 'Learn', kind: 'read', title: section.title, paragraphs: [], examples: section.examples });
  });
  if (steps[0]?.kind === 'read') steps[0].goal = goal;
  if (lesson.video) steps.push({ ...lesson.video, id: 'video', stage: 'Watch', kind: 'video' });
  lesson.tasks.forEach(task => {
    if (task.phase === 'write' && writingIntro) steps.push({ id: 'writing-introduction', stage: 'Write', kind: 'read', title: writingIntro.title, paragraphs: writingIntro.paragraphs, examples: writingIntro.examples });
    steps.push({ id: task.id, stage: task.phase === 'guided' ? 'Practise' : task.phase === 'write' ? 'Write' : 'Quiz', kind: 'task', task });
  });
  if (lesson.tasks.length) steps.push({ id: 'summary', stage: 'Review', kind: 'summary' });
  return steps;
}

export function emptyBeginnerAnswer(): BeginnerAnswer {
  return { value: '', submitted: false, reviewed: false, needsPractice: false, revision: '' };
}

export function emptyBeginnerAttempt(lesson: BeginnerLesson): BeginnerAttempt {
  return { version: BEGINNER_CONTENT_VERSION, stepId: beginnerSteps(lesson)[0].id, read: [], answers: {}, finishedAt: null, videoRoute: null };
}

export function taskDone(task: BeginnerTask, answer: BeginnerAnswer | undefined) {
  if (!answer?.submitted || !answer.value.trim()) return false;
  if (task.kind === 'choice') return /^\d+$/.test(answer.value) && Number(answer.value) < task.options.length;
  return true;
}

export function stepDone(step: BeginnerStep, attempt: BeginnerAttempt) {
  if (step.kind === 'summary') return !!attempt.finishedAt;
  if (step.kind === 'task') return taskDone(step.task, attempt.answers[step.task.id]);
  if (step.kind === 'video') return !!attempt.videoRoute && attempt.read.includes(step.id);
  return attempt.read.includes(step.id);
}

export function firstUnfinished(lesson: BeginnerLesson, attempt: BeginnerAttempt) {
  const steps = beginnerSteps(lesson);
  const index = steps.findIndex(step => !stepDone(step, attempt));
  return index < 0 ? steps.length - 1 : index;
}

export function readyToFinish(lesson: BeginnerLesson, attempt: BeginnerAttempt) {
  return beginnerSteps(lesson).filter(s => s.kind !== 'summary').every(s => stepDone(s, attempt));
}

export function beginnerResult(lesson: BeginnerLesson, attempt: BeginnerAttempt): BeginnerResult {
  const choices = lesson.tasks.filter(t => t.kind === 'choice' && t.phase === 'quiz');
  return {
    choiceTotal: choices.length,
    choiceCorrect: choices.filter(t => t.kind === 'choice' && taskDone(t, attempt.answers[t.id]) && Number(attempt.answers[t.id].value) === t.answer).length,
    reviewedResponses: lesson.tasks.filter(t => t.kind === 'response' && taskDone(t, attempt.answers[t.id])).length,
    revisit: lesson.tasks.filter(t => {
      const answer = attempt.answers[t.id];
      return answer?.submitted && (answer.needsPractice || (t.kind === 'choice' && Number(answer.value) !== t.answer));
    }).map(t => t.id),
  };
}

export function beginnerAttemptKey(userId: string | null, lessonId: string) {
  return `em-grammar-draft-v1:${userId ?? 'guest'}:${lessonId}`;
}

export function parseBeginnerAttempt(raw: unknown, lesson: BeginnerLesson): BeginnerAttempt {
  const fresh = emptyBeginnerAttempt(lesson);
  if (!raw || typeof raw !== 'object') return fresh;
  const stored = raw as Partial<BeginnerAttempt>;
  if (stored.version !== BEGINNER_CONTENT_VERSION) return fresh;
  const steps = beginnerSteps(lesson);
  const readIds = steps.filter(s => s.kind === 'read' || s.kind === 'visual' || s.kind === 'video').map(s => s.id);
  const read = Array.isArray(stored.read) ? readIds.filter(id => stored.read!.includes(id)) : [];
  const answers: Record<string, BeginnerAnswer> = {};
  for (const task of lesson.tasks) {
    const saved = stored.answers?.[task.id];
    if (!saved || typeof saved !== 'object' || typeof saved.value !== 'string') continue;
    const value = saved.value.slice(0, 5000);
    const valid = task.kind === 'choice' ? /^\d+$/.test(value) && Number(value) < task.options.length : !!value.trim();
    answers[task.id] = {
      value: task.kind === 'choice' && !valid ? '' : value,
      submitted: valid && saved.submitted === true,
      reviewed: valid && saved.submitted === true && saved.reviewed === true,
      needsPractice: saved.needsPractice === true,
      revision: typeof saved.revision === 'string' ? saved.revision.slice(0, 5000) : '',
    };
  }
  const videoRoute = stored.videoRoute === 'watched' || stored.videoRoute === 'recap' ? stored.videoRoute : null;
  const attempt = { ...fresh, read, answers, videoRoute };
  if (typeof stored.finishedAt === 'number' && Number.isFinite(stored.finishedAt) && stored.finishedAt > 0 && readyToFinish(lesson, attempt)) attempt.finishedAt = stored.finishedAt;
  const requested = steps.findIndex(s => s.id === stored.stepId);
  attempt.stepId = steps[Math.max(0, Math.min(requested < 0 ? firstUnfinished(lesson, attempt) : requested, firstUnfinished(lesson, attempt)))].id;
  return attempt;
}

export function loadBeginnerAttempt(userId: string | null, lesson: BeginnerLesson): BeginnerAttempt {
  try { return parseBeginnerAttempt(JSON.parse(localStorage.getItem(beginnerAttemptKey(userId, lesson.id)) ?? 'null'), lesson); }
  catch { return emptyBeginnerAttempt(lesson); }
}

export function saveBeginnerAttempt(userId: string | null, lesson: BeginnerLesson, attempt: BeginnerAttempt): boolean {
  try {
    const key = beginnerAttemptKey(userId, lesson.id);
    const previous = localStorage.getItem(key);
    if (previous) {
      try {
        const old = JSON.parse(previous) as Partial<BeginnerAttempt>;
        if (typeof old.version === 'number' && old.version !== BEGINNER_CONTENT_VERSION) {
          const archiveKey = `${key}:archive:v${old.version}`;
          if (!localStorage.getItem(archiveKey)) localStorage.setItem(archiveKey, previous);
        }
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
      }
    }
    localStorage.setItem(key, JSON.stringify(attempt)); return true;
  }
  catch { return false; }
}
