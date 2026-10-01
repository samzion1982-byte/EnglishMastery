'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../icon';
import { useDialog } from '../use-dialog';
import {
  GRAMMAR_LEVELS,
  PASS_MARK,
  isLessonComplete,
  SYLLABUS_UNITS,
  lessonById,
  lessonsFor,
  levelStats,
  loadGrammar,
  saveGrammar,
  scoreOf,
  withChoice,
  withCompletion,
  withReviewedCompletion,
  withCursor,
  xpFor,
  type Diagram,
  type GrammarLesson,
  type GrammarLevelId,
  type GrammarState,
  type Interaction,
} from '@/lib/grammar-course';
import { BeginnerLessonPlayer } from './beginner-lesson';

type Slide =
  | { kind: 'see' }
  | { kind: 'practice'; index: number }
  | { kind: 'quiz'; index: number }
  | { kind: 'write' }
  | { kind: 'done' };

function slidesFor(lesson: GrammarLesson): Slide[] {
  const slides: Slide[] = [{ kind: 'see' }];
  lesson.practice.forEach((_, index) => slides.push({ kind: 'practice', index }));
  lesson.quiz.forEach((_, index) => slides.push({ kind: 'quiz', index }));
  if (lesson.type === 'capstone') slides.push({ kind: 'write' });
  slides.push({ kind: 'done' });
  return slides;
}

export function GrammarLearning({
  userId,
  onPractice,
  onAward,
}: {
  userId: string | null;
  onPractice: () => void;
  onAward: (xp: number, completionOnly?: boolean) => void;
}) {
  const [state, setState] = useState<GrammarState | null>(null);
  const [screen, setScreen] = useState<'levels' | 'path' | 'lesson'>('levels');
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [welcomeLesson, setWelcomeLesson] = useState<GrammarLesson | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    const loaded = loadGrammar(userId);
    setState(loaded);
    setChooserOpen(!loaded.hideChooser && !loaded.chosenLevel);
    setScreen('levels');
    setLessonId(null);
    setSaveFailed(false);
  }, [userId]);

  function commit(next: GrammarState) {
    setState(next);
    setSaveFailed(!saveGrammar(userId, next));
  }

  function chooseLevel(level: GrammarLevelId) {
    if (!state) return;
    commit(withChoice(state, level));
    setChooserOpen(false);
    setScreen('path');
  }

  function openLevel(level: GrammarLevelId) {
    if (!state) return;
    commit(withChoice(state, level));
    setChooserOpen(false);
    setScreen('path');
  }

  function startLesson(lesson: GrammarLesson) {
    if (lesson.level === 'beginner') {
      setWelcomeLesson(lesson);
      return;
    }
    openLesson(lesson);
  }

  function openLesson(lesson: GrammarLesson) {
    if (!state) return;
    setChooserOpen(false);
    commit(withCursor(withChoice(state, lesson.level), lesson.level, lesson.id));
    setLessonId(lesson.id);
    setScreen('lesson');
  }

  if (!state) return <div className="card skeleton tall" aria-busy="true" aria-label="Loading grammar" />;

  const lesson = lessonId ? lessonById(lessonId) : null;

  if (screen === 'path' || (screen === 'lesson' && lesson)) {
    return (
      <>
        {saveFailed && <p className="grammar-note" role="alert">Your course progress could not be saved in this browser. Keep this page open to keep your current progress.</p>}
        <LessonPath state={state} onLevels={() => setScreen('levels')} onOpen={openLesson} onStart={startLesson} />
        {screen === 'lesson' && lesson?.manuscript && (
          <GrammarOverlay>
            <BeginnerLessonPlayer
              key={`${userId ?? 'guest'}:${lesson.id}`}
              lesson={lesson.manuscript}
              userId={userId}
              complete={isLessonComplete(lesson, state.levels.beginner.log[lesson.id])}
              onBack={() => setScreen('path')}
              onComplete={(result) => {
                const already = !!state.levels.beginner.log[lesson.id];
                commit(withReviewedCompletion(state, lesson, result));
                if (!already) onAward(xpFor(lesson.type), true);
              }}
              onNext={nextLesson(lesson) ? () => openLesson(nextLesson(lesson)!) : undefined}
              onPractice={onPractice}
            />
          </GrammarOverlay>
        )}
        {welcomeLesson && (
          <BeginnerWelcome onStart={() => {
            const lesson = welcomeLesson;
            setWelcomeLesson(null);
            openLesson(lesson);
          }} />
        )}
        {screen === 'lesson' && lesson && !lesson.manuscript && (
          <LessonPlayer
            key={lesson.id}
            lesson={lesson}
            onBack={() => setScreen('path')}
            onDone={(score) => {
              const already = !!state.levels[lesson.level].log[lesson.id];
              commit(withCompletion(state, lesson, score));
              if (!already) onAward(xpFor(lesson.type));
            }}
            onPractice={onPractice}
            onOpen={(id) => {
              const target = lessonById(id);
              if (!target) return;
              openLesson(target);
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <LevelPicker state={state} onOpen={openLevel} onChooseTopic={() => setChooserOpen(true)} />
      {chooserOpen && (
        <TopicModal
          chosenLevel={state.chosenLevel}
          onChoose={chooseLevel}
          onOpen={openLesson}
          onClose={() => setChooserOpen(false)}
        />
      )}
    </>
  );
}

function LevelPicker({ state, onOpen, onChooseTopic }: { state: GrammarState; onOpen: (level: GrammarLevelId) => void; onChooseTopic: () => void }) {
  return (
    <>
      <div className="grammar-page-head">
        <div className="section-head">
          <h1>Grammar Learning</h1>
          <p>{state.chosenLevel ? 'Your level is marked. Open it to see the syllabus and what you have finished.' : 'Look through the topics, then choose a level.'}</p>
        </div>
        <button type="button" className="s-btn primary" onClick={onChooseTopic}>Choose Topic</button>
      </div>
      <div className="grammar-levels">
        {GRAMMAR_LEVELS.map((item) => {
          const stats = levelStats(item.id, state.levels[item.id]);
          const selected = item.id === state.chosenLevel;
          return (
            <button key={item.id} type="button" className={`grammar-level track-${item.id}${selected ? ' selected' : ''}`} onClick={() => onOpen(item.id)}>
              <span className="grammar-level-mark" aria-hidden="true"><Icon kind={item.id === 'advanced' ? 'star' : item.id === 'intermediate' ? 'layers' : 'pen'} /></span>
              <span className="grammar-level-copy">
                <strong>{item.title}</strong>
                {item.note && <span>{item.note}</span>}
              </span>
              <span className="grammar-level-meta">{stats.done === 0 ? `${stats.total} ${item.id === 'beginner' ? 'activities' : 'topics'}` : `${stats.percent}% complete`}</span>
              {selected && <span className="grammar-chip">Choice selected</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}

function GrammarOverlay({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const node = document.createElement('div');
    document.body.appendChild(node);
    setHost(node);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
      node.remove();
    };
  }, []);
  if (!host) return null;
  return createPortal(<div className="student grammar-overlay">{children}</div>, host);
}

function TopicModal({
  chosenLevel,
  onChoose,
  onOpen,
  onClose,
}: {
  chosenLevel: GrammarLevelId | null;
  onChoose: (level: GrammarLevelId) => void;
  onOpen: (lesson: GrammarLesson) => void;
  onClose: () => void;
}) {
  return (
    <GrammarOverlay>
      <TopicDialog chosenLevel={chosenLevel} onChoose={onChoose} onOpen={onOpen} onClose={onClose} />
    </GrammarOverlay>
  );
}

function TopicDialog({
  chosenLevel,
  onChoose,
  onOpen,
  onClose,
}: {
  chosenLevel: GrammarLevelId | null;
  onChoose: (level: GrammarLevelId) => void;
  onOpen: (lesson: GrammarLesson) => void;
  onClose: () => void;
}) {
  const dialog = useDialog<HTMLDivElement>(onClose);
  return (
    <div className="s-dialog-backdrop">
      <div className="card s-dialog grammar-modal" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="grammar-choose-title">
        <div className="grammar-modal-head">
          <p className="eyebrow">Grammar Learning</p>
          <button type="button" className="grammar-slide-close" onClick={onClose} aria-label="Close"><Icon kind="close" /></button>
        </div>
        <h2 id="grammar-choose-title">Choose a topic</h2>
        <p>Each column is the full topic list for that level. Click a topic to start it.</p>
        <div className="grammar-modal-grid">
          {GRAMMAR_LEVELS.map((item) => {
            const lessons = lessonsFor(item.id);
            return (
              <section key={item.id} className={`grammar-modal-col track-${item.id}`}>
                <h3>{item.title}</h3>
                <ol>
                  {lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <button type="button" className="grammar-topic-link" onClick={() => onOpen(lesson)}>{lesson.title}</button>
                    </li>
                  ))}
                </ol>
                <button type="button" className="s-btn primary block" disabled={item.id === chosenLevel} onClick={() => onChoose(item.id)}>
                  {item.id === chosenLevel ? 'Choice selected' : chosenLevel ? `Switch to ${item.title}` : `Choose ${item.title}`}
                </button>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BeginnerWelcome({ onStart }: { onStart: () => void }) {
  const dialog = useDialog<HTMLDivElement>(onStart);
  return (
    <GrammarOverlay>
      <div className="s-dialog-backdrop grammar-welcome-backdrop">
        <div className="card s-dialog grammar-welcome" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="grammar-welcome-title">
          <span className="grammar-welcome-mark" aria-hidden="true"><Icon kind="sparkle" /></span>
          <p className="eyebrow">Beginner</p>
          <h2 id="grammar-welcome-title">Grammar is not hard.</h2>
          <p className="grammar-welcome-lead">Regular practice is what makes it easy.</p>
          <ul className="grammar-welcome-points">
            <li><Icon kind="chat" /><span>You already use it when you speak.</span></li>
            <li><Icon kind="layers" /><span>One small step at a time.</span></li>
            <li><Icon kind="star" /><span>A mistake shows what to practise next.</span></li>
          </ul>
          <p>You do not have to be perfect. You only have to begin.</p>
          <button type="button" className="s-btn primary block" onClick={onStart}>Let&apos;s start</button>
        </div>
      </div>
    </GrammarOverlay>
  );
}

function LessonPath({
  state,
  onLevels,
  onOpen,
  onStart,
}: {
  state: GrammarState;
  onLevels: () => void;
  onOpen: (lesson: GrammarLesson) => void;
  onStart: (lesson: GrammarLesson) => void;
}) {
  const level = state.currentLevel;
  const meta = GRAMMAR_LEVELS.find((item) => item.id === level)!;
  const progress = state.levels[level];
  const lessons = lessonsFor(level);
  const stats = levelStats(level, progress);
  const startAt = lessons.find(lesson => !isLessonComplete(lesson, progress.log[lesson.id])) ?? lessons[0];

  return (
    <div className={`grammar-path track-${level}`}>
      <div className="section-head">
        <h1>{meta.title}</h1>
        {meta.note && <p>{meta.note}</p>}
      </div>
      <section className="card grammar-percent" aria-label="Completion">
        <div>
          <p className="eyebrow">Completion</p>
          <h2>{stats.percent}%</h2>
          <p>{stats.done} of {stats.total} {level === 'beginner' ? 'activities completed' : 'topics passed'}</p>
        </div>
        <span className="bar lg" aria-hidden="true"><span style={{ width: `${stats.percent}%` }} /></span>
      </section>
      <div className="grammar-starts">
        {startAt && (
          <button type="button" className="s-btn primary" onClick={() => onStart(startAt)}>
            <Icon kind="play" />
            Let&apos;s Start
          </button>
        )}
      </div>
      <div className="grammar-swatches" aria-label="Levels">
        {SYLLABUS_UNITS[level].map((unit) => {
          const unitLessons = unit.lessonIds.map((id) => lessonById(id)).filter((item): item is GrammarLesson => !!item);
          const unitDone = unitLessons.filter((item) => isLessonComplete(item, progress.log[item.id])).length;
          const complete = unitLessons.length > 0 && unitDone === unitLessons.length;
          return (
            <section key={unit.number} className={`grammar-swatch${complete ? ' done' : ''}`}>
              <div className="grammar-swatch-head">
                <span className="grammar-swatch-mark" aria-hidden="true">{complete ? <Icon kind="check" /> : unit.number === 0 ? <Icon kind="book" /> : unit.number}</span>
                <div>
                  <strong>{unit.number === 0 ? unit.title : `Level ${unit.number}`}</strong>
                  <span>{unit.number === 0 ? 'Short readings. Practice starts in Level 1.' : unit.title}</span>
                  <small>{complete ? 'Completed' : `${unitDone} of ${unitLessons.length} ${level === 'beginner' ? 'activities' : 'topics'}`}</small>
                </div>
              </div>
              <ol className="grammar-topics">
                {unitLessons.map((lesson) => {
                  const passed = isLessonComplete(lesson, progress.log[lesson.id]);
                  return (
                    <li key={lesson.id}>
                      <button type="button" className={passed ? 'done' : ''} onClick={() => onOpen(lesson)}>
                        {passed && <Icon kind="check" />}
                        {lesson.title}
                        {lesson.type !== 'concept' && <small className="beginner-topic-tag">{lesson.type === 'review' ? 'Review' : 'Final practice'}</small>}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
      <button type="button" className="s-btn ghost" onClick={onLevels}>Categories</button>
    </div>
  );
}

function LessonPlayer(props: {
  lesson: GrammarLesson;
  onBack: () => void;
  onDone: (score: number) => void;
  onPractice: () => void;
  onOpen: (id: string) => void;
}) {
  return (
    <GrammarOverlay>
      <LessonDialog {...props} />
    </GrammarOverlay>
  );
}

function LessonDialog({
  lesson,
  onBack,
  onDone,
  onPractice,
  onOpen,
}: {
  lesson: GrammarLesson;
  onBack: () => void;
  onDone: (score: number) => void;
  onPractice: () => void;
  onOpen: (id: string) => void;
}) {
  const slides = useMemo(() => slidesFor(lesson), [lesson]);
  const dialog = useDialog<HTMLDivElement>(onBack);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, { value: string; ok: boolean }>>({});
  const [draft, setDraft] = useState('');
  const [checks, setChecks] = useState<boolean[]>(() => (lesson.checklist ?? []).map(() => false));
  const [saved, setSaved] = useState(false);
  const slide = slides[index];
  const item = slide.kind === 'practice' ? lesson.practice[slide.index] : slide.kind === 'quiz' ? lesson.quiz[slide.index] : null;
  const answerKey = slide.kind === 'practice' || slide.kind === 'quiz' ? `${slide.kind}-${slide.index}` : '';
  const stored = answerKey ? answers[answerKey] : undefined;
  const shown = stored?.value ?? picked;
  const quizCorrect = lesson.quiz.filter((_, quizIndex) => answers[`quiz-${quizIndex}`]?.ok).length;
  const quizScore = lesson.quiz.length ? scoreOf(quizCorrect, lesson.quiz.length) : 100;
  const passed = quizScore >= PASS_MARK;
  const writingReady = draft.trim().length >= 40 && checks.every(Boolean);
  const canNext = slide.kind === 'see' || slide.kind === 'done' || (slide.kind === 'write' ? writingReady : !!stored);

  useEffect(() => {
    setIndex(0);
    setPicked(null);
    setAnswers({});
    setDraft('');
    setChecks((lesson.checklist ?? []).map(() => false));
    setSaved(false);
  }, [lesson]);

  function answer(value: string, ok: boolean) {
    if (!answerKey || answers[answerKey]) return;
    setPicked(value);
    setAnswers((current) => ({ ...current, [answerKey]: { value, ok } }));
  }

  function go(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    const entering = slides[nextIndex];
    if (entering.kind === 'done' && !saved) {
      setSaved(true);
      if (lesson.type === 'capstone' || quizScore >= PASS_MARK) onDone(lesson.type === 'capstone' ? 100 : quizScore);
    }
    setPicked(null);
    setIndex(nextIndex);
  }

  return (
    <div className="s-dialog-backdrop">
      <div className={`card s-dialog grammar-slide-modal track-${lesson.level}`} ref={dialog} role="dialog" aria-modal="true" aria-labelledby="grammar-slide-title">
        <div className="grammar-slide-head">
          <div>
            <p className="grammar-step">Slide {index + 1} of {slides.length}</p>
            <h2 id="grammar-slide-title">{lesson.title}</h2>
            <div className="grammar-slide-dots" aria-hidden="true">
              {slides.map((entry, dot) => <i key={`${entry.kind}-${dot}`} className={dot === index ? 'on' : dot < index ? 'done' : ''} />)}
            </div>
          </div>
          <button type="button" className="grammar-slide-close" onClick={onBack} aria-label="Close">
            <Icon kind="close" />
          </button>
        </div>
        <div key={index} className="grammar-slide-body">
          {slide.kind === 'see' && (
            <>
              <DiagramView diagram={lesson.diagram} />
              <p className="grammar-summary">{lesson.summary}</p>
              <ul className="grammar-examples">{lesson.examples.map((line) => <li key={line}>{line}</li>)}</ul>
            </>
          )}
          {item && <InteractionView key={answerKey} item={item} picked={shown ?? null} onAnswer={answer} />}
          {slide.kind === 'write' && (
            <div className="grammar-write">
              <p className="grammar-summary">{lesson.prompt}</p>
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={7} aria-label="Your writing" placeholder="Write the way you would actually say it." />
              <ul className="grammar-checks">
                {(lesson.checklist ?? []).map((line, checkIndex) => (
                  <li key={line}>
                    <label>
                      <input type="checkbox" checked={checks[checkIndex] ?? false} onChange={() => setChecks((list) => list.map((on, i) => (i === checkIndex ? !on : on)))} />
                      {line}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {slide.kind === 'done' && (
            <div className="grammar-result">
              <span className="grammar-medal"><Icon kind={passed ? 'check' : 'repeat'} /></span>
              <h2>{passed ? 'Passed' : 'Not passed yet'}</h2>
              <p>{passed ? `${quizScore}% — this topic is complete.` : `${quizScore}%. A pass is ${PASS_MARK}%. You can try these slides again, or open any other topic.`}</p>
              <div className="grammar-actions">
                {nextLesson(lesson) && <button type="button" className="s-btn primary" onClick={() => onOpen(nextLesson(lesson)!.id)}>Next topic</button>}
                {!passed && <button type="button" className="s-btn ghost" onClick={() => { setSaved(false); setAnswers({}); setIndex(0); }}>Start again</button>}
                {lesson.type === 'capstone' && <button type="button" className="s-btn ghost" onClick={onPractice}>Keep writing in Practice Corner</button>}
              </div>
            </div>
          )}
        </div>
        <div className="grammar-slide-nav">
          <button type="button" className="s-btn ghost" onClick={() => go(index - 1)} disabled={index === 0}>Back</button>
          {index < slides.length - 1 ? (
            <button type="button" className="s-btn primary" onClick={() => go(index + 1)} disabled={!canNext}>Next</button>
          ) : (
            <button type="button" className="s-btn primary" onClick={onBack}>Close</button>
          )}
        </div>
      </div>
    </div>
  );
}


function nextLesson(lesson: GrammarLesson) {
  const lessons = lessonsFor(lesson.level);
  const index = lessons.findIndex((item) => item.id === lesson.id);
  return index >= 0 ? lessons[index + 1] ?? null : null;
}

function DiagramView({ diagram }: { diagram: Diagram }) {
  if (diagram.kind === 'timeline') {
    return (
      <figure className="grammar-diagram">
        <figcaption>{diagram.title}</figcaption>
        <div className="grammar-time">
          <span className="grammar-time-line" />
          {diagram.points.map((point) => (
            <span key={point.label} className={`grammar-time-point${point.now ? ' now' : ''}`} style={{ left: `${point.at}%` }}>
              <b>{point.label}</b>
              <small>{point.text}</small>
            </span>
          ))}
        </div>
      </figure>
    );
  }
  if (diagram.kind === 'blocks') {
    return (
      <figure className="grammar-diagram">
        <figcaption>{diagram.title}</figcaption>
        <div className="grammar-blocks">
          {diagram.parts.map((part) => (
            <span key={`${part.role}-${part.text}`} className={`grammar-block tone-${part.tone}`}>
              <small>{part.role}</small>
              {part.text}
            </span>
          ))}
        </div>
      </figure>
    );
  }
  if (diagram.kind === 'flow') {
    return (
      <figure className="grammar-diagram">
        <figcaption>{diagram.title}</figcaption>
        <div className="grammar-flow">
          <p className="grammar-flow-q">{diagram.start}</p>
          <div>
            <p><b>{diagram.yes.label}</b>{diagram.yes.result}</p>
            <p><b>{diagram.no.label}</b>{diagram.no.result}</p>
          </div>
        </div>
      </figure>
    );
  }
  if (diagram.kind === 'compare') {
    return (
      <figure className="grammar-diagram">
        <figcaption>{diagram.title}</figcaption>
        <div className="grammar-compare">
          {[diagram.left, diagram.right].map((side) => (
            <div key={side.label}>
              <strong>{side.label}</strong>
              <ul>{side.lines.map((line) => <li key={line}>{line}</li>)}</ul>
            </div>
          ))}
        </div>
      </figure>
    );
  }
  return (
    <figure className="grammar-diagram">
      <figcaption>{diagram.title}</figcaption>
      <ul className="grammar-icons">
        {diagram.items.map((item) => (
          <li key={item.label}>
            <span>{item.mark}</span>
            <strong>{item.label}</strong>
            <small>{item.line}</small>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function InteractionView({
  item,
  picked,
  onAnswer,
}: {
  item: Interaction;
  picked: string | null;
  onAnswer: (value: string, ok: boolean) => void;
}) {
  return (
    <div className="grammar-ask">
      <p>{item.kind === 'choice' || item.kind === 'blank' || item.kind === 'tiles' || item.kind === 'spot' || item.kind === 'tap' ? item.prompt : ''}</p>
      {item.kind === 'choice' && (
        <div className="grammar-options">
          {item.options.map((option, index) => (
            <button key={option} type="button" className={choiceClass(picked, option, index === item.answer)} onClick={() => onAnswer(option, index === item.answer)} disabled={!!picked}>
              {option}
            </button>
          ))}
        </div>
      )}
      {item.kind === 'tap' && <WordPick words={item.words} answer={item.words[item.answer]} picked={picked} onAnswer={onAnswer} />}
      {item.kind === 'spot' && <WordPick words={item.words} answer={item.words[item.answer]} picked={picked} onAnswer={onAnswer} hint={picked ? `Use “${item.fix}” instead.` : undefined} />}
      {item.kind === 'blank' && <BlankItem item={item} picked={picked} onAnswer={onAnswer} />}
      {item.kind === 'tiles' && <TileItem item={item} picked={picked} onAnswer={onAnswer} />}
      {picked && <p className={`grammar-why${pickedMatches(item, picked) ? ' ok' : ''}`} role="status">{item.why}</p>}
    </div>
  );
}

function choiceClass(picked: string | null, option: string, correct: boolean) {
  if (!picked) return 's-btn ghost';
  if (option === picked && correct) return 's-btn primary';
  if (option === picked) return 's-btn ghost grammar-wrong';
  if (correct) return 's-btn ghost grammar-show';
  return 's-btn ghost';
}

function pickedMatches(item: Interaction, picked: string) {
  if (item.kind === 'choice') return item.options[item.answer] === picked;
  if (item.kind === 'tap' || item.kind === 'spot') return item.words[item.answer] === picked;
  if (item.kind === 'blank') return item.answer === picked;
  return item.answer.join(' ') === picked;
}

function WordPick({
  words,
  answer,
  picked,
  onAnswer,
  hint,
}: {
  words: string[];
  answer: string;
  picked: string | null;
  onAnswer: (value: string, ok: boolean) => void;
  hint?: string;
}) {
  return (
    <>
      <div className="grammar-words">
        {words.map((word, index) => (
          <button key={`${word}-${index}`} type="button" className={choiceClass(picked, word, word === answer)} onClick={() => onAnswer(word, word === answer)} disabled={!!picked}>
            {word}
          </button>
        ))}
      </div>
      {hint && <p className="grammar-fix">{hint}</p>}
    </>
  );
}

function BlankItem({
  item,
  picked,
  onAnswer,
}: {
  item: Extract<Interaction, { kind: 'blank' }>;
  picked: string | null;
  onAnswer: (value: string, ok: boolean) => void;
}) {
  const [over, setOver] = useState(false);
  function place(option: string) {
    onAnswer(option, option === item.answer);
  }
  return (
    <>
      <p
        className={`grammar-blank${over ? ' over' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          const option = event.dataTransfer.getData('text/plain');
          if (option) place(option);
        }}
      >
        {item.before} <strong>{picked ?? '______'}</strong> {item.after}
      </p>
      <div className="grammar-options">
        {item.options.map((option) => (
          <button
            key={option}
            type="button"
            draggable={!picked}
            className={choiceClass(picked, option, option === item.answer)}
            onDragStart={(event) => event.dataTransfer.setData('text/plain', option)}
            onClick={() => place(option)}
            disabled={!!picked}
          >
            {option}
          </button>
        ))}
      </div>
    </>
  );
}

function TileItem({
  item,
  picked,
  onAnswer,
}: {
  item: Extract<Interaction, { kind: 'tiles' }>;
  picked: string | null;
  onAnswer: (value: string, ok: boolean) => void;
}) {
  const [built, setBuilt] = useState<string[]>([]);
  const used = new Map<string, number>();
  for (const word of built) used.set(word, (used.get(word) ?? 0) + 1);
  const poolCounts = new Map<string, number>();
  for (const word of item.tiles) poolCounts.set(word, (poolCounts.get(word) ?? 0) + 1);

  function add(word: string) {
    if (picked) return;
    if ((used.get(word) ?? 0) >= (poolCounts.get(word) ?? 0)) return;
    setBuilt((list) => [...list, word]);
  }
  function remove(index: number) {
    if (picked) return;
    setBuilt((list) => list.filter((_, i) => i !== index));
  }

  const line = built.join(' ');
  const expected = item.answer.join(' ');

  return (
    <>
      <div className="grammar-built" aria-label="Your sentence">
        {built.length === 0 && <span className="grammar-placeholder">Tap the tiles in order</span>}
        {built.map((word, index) => (
          <button key={`${word}-${index}`} type="button" className="s-btn ghost" onClick={() => remove(index)}>{word}</button>
        ))}
      </div>
      <div className="grammar-options">
        {item.tiles.map((word, index) => {
          const taken = [...built].filter((piece) => piece === word).length;
          const before = item.tiles.slice(0, index).filter((piece) => piece === word).length;
          const hidden = before < taken;
          return (
            <button key={`${word}-${index}`} type="button" className="s-btn ghost" onClick={() => add(word)} disabled={!!picked || hidden} hidden={hidden}>
              {word}
            </button>
          );
        })}
      </div>
      {!picked && (
        <div className="grammar-actions">
          <button type="button" className="s-btn primary" disabled={!built.length} onClick={() => onAnswer(line, line === expected)}>Check</button>
          <button type="button" className="s-btn ghost" onClick={() => setBuilt([])}>Clear</button>
        </div>
      )}
    </>
  );
}
