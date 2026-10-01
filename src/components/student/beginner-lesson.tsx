'use client';

import { useEffect, useRef, useState } from 'react';
import type { BeginnerLesson, BeginnerTask } from '@/lib/beginner-types';
import {
  beginnerSteps, beginnerResult, emptyBeginnerAnswer, emptyBeginnerAttempt,
  firstUnfinished, loadBeginnerAttempt, readyToFinish, saveBeginnerAttempt, stepDone, taskDone,
  type BeginnerAnswer, type BeginnerAttempt, type BeginnerResult,
} from '@/lib/beginner-learning';
import { useDialog } from '../use-dialog';
import { Icon } from '../icon';
import { BeginnerBoard, boardItems } from './beginner-board';

export function BeginnerLessonPlayer({ lesson, userId, complete, onBack, onComplete, onNext, onPractice }: {
  lesson: BeginnerLesson;
  userId: string | null;
  complete: boolean;
  onBack: () => void;
  onComplete: (result: BeginnerResult) => void;
  onNext?: () => void;
  onPractice: () => void;
}) {
  const [attempt, setAttempt] = useState(() => loadBeginnerAttempt(userId, lesson));
  const [saveFailed, setSaveFailed] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const current = useRef(attempt);
  const finishing = useRef(false);
  const dialog = useDialog<HTMLDivElement>(onBack);
  const heading = useRef<HTMLHeadingElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const steps = beginnerSteps(lesson);
  const numbered = steps.filter(item => item.kind === 'read' && item.card && item.title !== 'Eight parts of speech');
  const index = Math.max(0, steps.findIndex(s => s.id === attempt.stepId));
  const step = steps[index];
  const result = beginnerResult(lesson, attempt);
  const readingOnly = lesson.tasks.length === 0;
  const phases = [...new Set(steps.map(s => s.stage))];
  const completedSteps = steps.filter(s => s.kind !== 'summary' && stepDone(s, attempt)).length;
  const canNext = step.kind === 'read' || step.kind === 'visual' || (step.kind === 'video' && !!attempt.videoRoute) || (step.kind === 'task' && taskDone(step.task, attempt.answers[step.task.id]));
  const lastReading = readingOnly && index === steps.length - 1;

  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, [attempt.stepId]);

  function update(next: BeginnerAttempt) {
    current.current = next;
    setAttempt(next);
    setSaveFailed(!saveBeginnerAttempt(userId, lesson, next));
  }

  function move(nextIndex: number) {
    const draft = current.current;
    const hereIndex = steps.findIndex(s => s.id === draft.stepId);
    if (hereIndex < 0 || nextIndex < 0 || nextIndex >= steps.length || nextIndex === hereIndex) return;
    const here = steps[hereIndex];
    if (nextIndex > hereIndex && here.kind === 'task' && !taskDone(here.task, draft.answers[here.task.id])) return;
    if (nextIndex > hereIndex && here.kind === 'video' && !draft.videoRoute) return;
    const read = (here.kind === 'read' || here.kind === 'visual' || here.kind === 'video') && nextIndex > hereIndex
      ? [...new Set([...draft.read, here.id])] : draft.read;
    const next = { ...draft, read };
    if (nextIndex > firstUnfinished(lesson, next)) return;
    update({ ...next, stepId: steps[nextIndex].id });
  }

  function answer(task: BeginnerTask, patch: Partial<BeginnerAnswer>) {
    const draft = current.current;
    update({ ...draft, finishedAt: null, answers: { ...draft.answers, [task.id]: { ...emptyBeginnerAnswer(), ...draft.answers[task.id], ...patch } } });
  }

  function finish() {
    if (finishing.current || !readyToFinish(lesson, current.current)) return;
    finishing.current = true;
    const next = { ...current.current, finishedAt: Date.now() };
    update(next);
    onComplete(beginnerResult(lesson, next));
    finishing.current = false;
  }

  function restart() {
    setConfirmRestart(false);
    update(emptyBeginnerAttempt(lesson));
  }

  function beginCourse() {
    if (!complete) {
      const here = steps[index];
      const read = here.kind === 'read' || here.kind === 'visual' ? [...new Set([...current.current.read, here.id])] : current.current.read;
      const next = { ...current.current, read, finishedAt: Date.now() };
      update(next);
      onComplete(beginnerResult(lesson, next));
    }
    if (onNext) onNext();
    else onBack();
  }

  return (
    <div className="s-dialog-backdrop">
      <div className="card s-dialog beginner-player track-beginner" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="beginner-lesson-title">
        <header className="beginner-player-header">
          <div><p className="eyebrow">Beginner · {lesson.kind === 'review' ? 'Mixed review' : lesson.kind === 'capstone' ? 'Final practice' : 'Learn at your own pace'}</p>{!(step.kind === 'read' && step.title === 'Important Instruction') && <h2 id="beginner-lesson-title">{lesson.title}</h2>}</div>
          <button type="button" className="grammar-slide-close" onClick={onBack} aria-label="Save and close lesson"><Icon kind="close" /></button>
        </header>
        {!readingOnly && <nav className="beginner-phases" aria-label="Lesson sections">
          {phases.map(phase => {
            const target = steps.findIndex(s => s.stage === phase);
            const here = phase === step.stage;
            return <button type="button" key={phase} aria-current={here ? 'step' : undefined} disabled={!here && target > firstUnfinished(lesson, attempt)} onClick={() => { if (!here) move(target); }}>{phase}</button>;
          })}
        </nav>}
        {!readingOnly && <div className="beginner-progress"><progress value={completedSteps} max={Math.max(1, steps.filter(s => s.kind !== 'summary').length)} aria-label="Lesson progress" /><span>{step.stage} · Step {index + 1} of {steps.length}</span></div>}
        <div className="beginner-player-body" ref={body}>
          <div key={step.id} className="beginner-step">
          {!(step.kind === 'read' && (step.title === lesson.title || step.card)) && step.kind !== 'visual' && <h3 className="beginner-step-title" ref={heading} tabIndex={-1}>{step.kind === 'read' ? step.title : step.kind === 'video' ? 'Watch before the assessment' : step.kind === 'summary' ? (attempt.finishedAt && complete ? 'Lesson completed' : 'Look back at your learning') : step.stage === 'Write' ? 'Use it yourself' : `${step.stage === 'Practise' ? 'Try it with help' : 'Your turn'} · ${step.task.id.replace(/^[GQW]/, '')}`}</h3>}
          {step.kind === 'read' && step.card && <article className={`beginner-part-slide${step.title === 'Eight parts of speech' ? ' tone-intro' : ` tone-${Math.max(0, numbered.findIndex(item => item.id === step.id)) % 8}`}`}>
            <span aria-hidden="true">{step.title === 'Eight parts of speech' ? '8 parts' : `${numbered.findIndex(item => item.id === step.id) + 1}${numbered.length > 1 ? ` of ${numbered.length}` : ''}`}</span>
            <h3 className="beginner-step-title" ref={heading} tabIndex={-1}>{step.title}</h3>
            {showsGoal(step) && <p className="beginner-learning-goal"><strong>In this lesson:</strong> {step.goal}</p>}
            {step.paragraphs.map((paragraph, i) => <p key={i}>{quoteParts(paragraph)}</p>)}
            {!!step.examples.length && (isNameList(step.examples) ? <ul className="beginner-name-list">{step.examples.map(example => {
              const target = steps.findIndex(item => item.kind === 'read' && item.card && item.title === example);
              const open = target > 0 && target <= firstUnfinished(lesson, attempt);
              return <li key={example}>{open ? <button type="button" onClick={() => move(target)}>{example}</button> : example}</li>;
            })}</ul> : <ul className="beginner-worked-examples">{step.examples.map(example => <li key={example}>{quoteParts(example)}</li>)}</ul>)}
          </article>}
          {step.kind === 'read' && !step.card && <div className={`beginner-prose${step.title === 'Important Instruction' ? ' beginner-instruction' : ''}`}>
            {step.title === 'Important Instruction' && <h2 id="beginner-lesson-title" className="beginner-instruction-title" ref={heading} tabIndex={-1}>Important Instruction</h2>}
            {step.title === 'Important Instruction' && <ol className="beginner-route"><li>Learn</li><li>Try</li><li>Watch</li><li>Assess</li></ol>}
            {showsGoal(step) && <p className="beginner-learning-goal"><strong>In this lesson:</strong> {step.goal}</p>}
            {step.paragraphs.map((paragraph, i) => <p key={i}>{quoteParts(paragraph)}</p>)}
            {!!step.examples.length && (boardItems(step.examples) ? <BeginnerBoard items={boardItems(step.examples)!} /> : <ul className="beginner-worked-examples">{step.examples.map((example, i) => <li key={i}>{quoteParts(example)}</li>)}</ul>)}
          </div>}
          {step.kind === 'video' && <div className="beginner-video">
            <p>{step.note}</p>
            <p><strong>Watch for this:</strong> {step.focus}</p>
            {step.youtubeId && <div className="beginner-video-frame">
              <iframe title={step.title} src={`https://www.youtube-nocookie.com/embed/${step.youtubeId}`} allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </div>}
            <a className="beginner-video-link" href={step.url} target="_blank" rel="noopener noreferrer">Watch {step.title} · {step.publisher} (opens a new tab)</a>
            <p>Return here after watching. If the video will not play, read the recap below instead.</p>
            <section className="beginner-video-recap" aria-label="Written recap"><h4>Before you start</h4><ul>{step.recap.map(line => <li key={line}>{line}</li>)}</ul></section>
            <fieldset className="beginner-video-route"><legend>How did you prepare?</legend>
              <label><input type="radio" name="video-route" checked={attempt.videoRoute === 'watched'} onChange={() => update({ ...current.current, videoRoute: 'watched' })} />I watched the video.</label>
              <label><input type="radio" name="video-route" checked={attempt.videoRoute === 'recap'} onChange={() => update({ ...current.current, videoRoute: 'recap' })} />I used the written recap because I could not watch.</label>
            </fieldset>
          </div>}
          {step.kind === 'task' && <>
            {step.stage === 'Write' && lesson.sections.filter(s => s.title === 'Check your paragraph').map(s => <ul key={s.title} className="beginner-writing-checks">{s.examples.map(line => <li key={line}>{line}</li>)}</ul>)}
            <BeginnerQuestion key={step.task.id} task={step.task} response={attempt.answers[step.task.id] ?? emptyBeginnerAnswer()} onChange={patch => answer(step.task, patch)} />
          </>}
          {step.kind === 'summary' && <div className="beginner-summary">
            <p>{attempt.finishedAt && complete ? 'You have worked through the notes, submitted your answers, and opened the explanations. Come back to practise again whenever you like.' : 'You have tried the activities. Review anything you want to practise again, then finish the lesson.'}</p>
            <div className="beginner-result-grid">
              {result.choiceTotal > 0 && <div><strong>{result.choiceCorrect} / {result.choiceTotal}</strong><span>Quiz choices correct</span></div>}
              <div><strong>{result.reviewedResponses}</strong><span>Written responses submitted</span></div>
            </div>
            <p className="beginner-assessment-note">Written answers are self-reviewed against an explanation. They are not automatically graded.</p>
            {lesson.sections.filter(s => s.title === 'Remember' || s.title === 'Choose your next practice').map(s => <section key={s.title}><h4>{s.title}</h4>{s.paragraphs.map(line => <p key={line}>{line}</p>)}</section>)}
            {!!result.revisit.length && <section><h4>Practise these again</h4><ul className="beginner-revisit">{result.revisit.map(id => {
              const task = lesson.tasks.find(t => t.id === id)!;
              return <li key={id}><button type="button" onClick={() => move(steps.findIndex(s => s.id === id))}>{task.prompt}</button></li>;
            })}</ul></section>}
            {attempt.finishedAt && complete && <div className="grammar-actions">
              {onNext && <button type="button" className="s-btn primary" onClick={onNext}>Next {lesson.kind === 'capstone' ? 'lesson' : 'activity'}</button>}
              {lesson.kind === 'capstone' && <button type="button" className="s-btn primary" onClick={onPractice}>Keep writing in Practice Corner</button>}
              <button type="button" className="s-btn ghost" onClick={onBack}>Back to Beginner</button>
            </div>}
            {confirmRestart ? <div className="beginner-restart-confirm"><p>Start again with blank answers? This replaces this attempt. Your completed lesson record stays.</p><button type="button" className="s-btn ghost" onClick={() => setConfirmRestart(false)}>Keep my answers</button><button type="button" className="s-btn ghost" onClick={restart}>Start a new attempt</button></div> : <button type="button" className="s-btn ghost" onClick={() => setConfirmRestart(true)}>Start again</button>}
          </div>}
          </div>
        </div>
        <footer className="beginner-player-footer">
          {saveFailed && <p role="alert">Your answers could not be saved. Keep this page open to keep working.</p>}
          <div className="grammar-slide-nav">
            <button type="button" className="s-btn ghost" disabled={index === 0} onClick={() => move(steps.findIndex(item => item.id === current.current.stepId) - 1)}>Back</button>
            {lastReading ? <button type="button" className="s-btn primary" onClick={beginCourse}>Let&apos;s Begin</button> : step.kind !== 'summary' ? <button type="button" className="s-btn primary" disabled={!canNext} onClick={() => move(steps.findIndex(item => item.id === current.current.stepId) + 1)}>{step.kind === 'video' && step.stage === 'Watch' ? 'Start the assessment' : steps[index + 1]?.kind === 'summary' ? 'Review my learning' : 'Continue'}</button> : <button type="button" className="s-btn primary" disabled={!readyToFinish(lesson, attempt)} onClick={attempt.finishedAt && complete ? onBack : finish}>{attempt.finishedAt && complete ? 'Close' : 'Finish lesson'}</button>}
          </div>
        </footer>
      </div>
    </div>
  );
}

function showsGoal(step: { kind: string; goal?: string; paragraphs: string[] }) {
  return step.kind === 'read' && !!step.goal && !step.paragraphs.join(' ').includes(step.goal);
}

function isNameList(examples: string[]) {
  return examples.length >= 3 && examples.every(item => item.length <= 24 && !/[.“]/.test(item));
}

function quoteParts(text: string) {
  return text.split(/(“[^”]+”)/g).map((part, index) => part.startsWith('“') ? <strong className="beginner-quote" key={index}>{part}</strong> : part);
}

function BeginnerQuestion({ task, response, onChange }: { task: BeginnerTask; response: BeginnerAnswer; onChange: (patch: Partial<BeginnerAnswer>) => void }) {
  const correct = task.kind === 'choice' && response.submitted && Number(response.value) === task.answer;
  return <div className="beginner-question">
    <p id="beginner-question-prompt" className="beginner-prompt">{task.prompt}</p>
    {task.kind === 'choice' ? <fieldset className="beginner-choices" aria-labelledby="beginner-question-prompt" disabled={response.submitted}>
      <legend className="sr-only">Choose an answer</legend>
      {task.options.map((option, i) => <label key={i} className={`${response.value === String(i) ? 'selected' : ''} ${response.submitted && i === task.answer ? 'correct' : ''}`}>
        <input type="radio" name="beginner-answer" value={i} checked={response.value === String(i)} onChange={() => onChange({ value: String(i) })} />
        <span><b>{String.fromCharCode(65 + i)}.</b> {option}</span>
        {response.submitted && i === task.answer && <small>Correct answer</small>}
      </label>)}
    </fieldset> : <>
      <label htmlFor="beginner-answer">Your answer</label>
      <textarea id="beginner-answer" value={response.value} onChange={event => onChange({ value: event.target.value })} readOnly={response.submitted} maxLength={5000} rows={task.phase === 'write' ? 6 : 3} placeholder={task.phase === 'write' ? 'Write your own sentences here.' : 'Try an answer in your own words.'} aria-describedby="beginner-question-prompt" />
    </>}
    {!response.submitted && <button type="button" className="s-btn primary" disabled={!response.value.trim()} onClick={() => onChange(task.kind === 'response' ? { submitted: true, reviewed: true } : { submitted: true })}>{task.kind === 'choice' ? 'Check my answer' : 'Compare with the explanation'}</button>}
    {response.submitted && <div className={`beginner-feedback ${correct ? 'correct' : ''}`} role="status">
      <h4>{task.kind === 'choice' ? correct ? 'That’s right' : 'Let’s look at this one' : 'Compare and learn'}</h4>
      {task.kind === 'choice' && !correct && <p><strong>Correct answer:</strong> {task.options[task.answer]}</p>}
      <p>{task.explanation}</p>
      {task.kind === 'response' && <p className="beginner-assessment-note">Your words may be different and still be correct. Check the idea, not just the wording.</p>}
      <button type="button" className="s-btn ghost" onClick={() => onChange(emptyBeginnerAnswer())}>Try this question again</button>
    </div>}
  </div>;
}
