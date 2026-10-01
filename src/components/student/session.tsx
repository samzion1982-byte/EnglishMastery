'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../icon';
import { GoalRing } from './goal-ring';
import { resolveStudy, useWord } from './use-word';
import { flyXp } from './fly-xp';
import { WordHead, WordReveal } from './word-view';
import type { WordEntry } from '@/lib/dictionary';
import type { Language, LearnerData, StudyWord } from '@/lib/learner';
import type { ThesaurusId } from '@/lib/thesaurus';
import { distractorPool, learnedToday, levelsOf, quizOptions, streakOf, type SessionItem } from '@/lib/learner-stats';
import { playCue } from '@/lib/sound';
import { XP } from '@/lib/srs';
import { entriesFor } from '@/lib/word-store';

export type Outcome = 'learned' | 'correct' | 'wrong';
type Result = { outcome: Outcome; picked?: string };

function LearnCard({
  word,
  language,
  thesaurus,
  revisit,
  counter,
  onDone,
}: {
  word: StudyWord;
  language: Language;
  thesaurus: ThesaurusId;
  revisit: boolean;
  counter: string;
  onDone: () => void;
}) {
  const { word: resolved, loading } = useWord(word);
  const [locking, setLocking] = useState(false);
  const xpChip = useRef<HTMLSpanElement>(null);

  async function finish() {
    if (locking) return;
    setLocking(true);
    playCue('ok');
    if (xpChip.current) await flyXp(xpChip.current);
    onDone();
  }

  useEffect(() => {
    if (revisit) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Enter' || event.target instanceof HTMLButtonElement || event.target instanceof HTMLInputElement) return;
      event.preventDefault();
      void finish();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="card study-card open">
      <p className="eyebrow accent">
        <Icon kind="sparkle" /> {revisit ? 'Review' : 'New word'} · {counter}
      </p>
      <WordHead
        word={word}
        resolved={resolved}
        auto={!loading && !revisit}
        language={language}
        showTongue
        thesaurus={thesaurus}
      />
      <WordReveal word={word} resolved={resolved} language={language} loading={loading} />
      {!revisit && (
        <div className="card-actions">
          <button type="button" className="s-btn primary lg block got-it" onClick={() => void finish()} disabled={locking}>
            Got it
            <span ref={xpChip} className="got-xp">
              +{XP.learn}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function QuizCard({
  word,
  right,
  options,
  initialPicked,
  onAnswer,
  onNext,
}: {
  word: StudyWord;
  right: string;
  options: string[];
  initialPicked?: string;
  onAnswer: (correct: boolean, picked: string) => void;
  onNext: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(initialPicked ?? null);
  const isRight = picked === right;

  function choose(option: string) {
    if (picked !== null) return;
    setPicked(option);
    const correct = option === right;
    playCue(correct ? 'ok' : 'miss');
    onAnswer(correct, option);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement) return;
      const n = Number(event.key) || ('abcd'.indexOf(event.key.toLowerCase()) + 1);
      if (picked === null && n >= 1 && n <= options.length) choose(options[n - 1]);
      else if (picked !== null && event.key === 'Enter') onNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className={`card study-card quiz${picked === null ? '' : isRight ? ' is-right' : ' is-wrong'}`}>
      <p className="eyebrow accent">
        <Icon kind="target" /> Review
      </p>
      <h1 className="quiz-q">
        What does <em>{word.word}</em> mean?
      </h1>
      <div className="options">
        {options.map((option, i) => {
          const state = picked === null ? '' : option === right ? ' correct' : option === picked ? ' incorrect' : ' dim';
          return (
            <button key={option} type="button" className={`option${state}`} onClick={() => choose(option)} disabled={picked !== null}>
              <span className="option-key">{i + 1}</span>
              <span>{option}</span>
              {picked !== null && option === right && <Icon kind="check" />}
              {picked === option && option !== right && <Icon kind="close" />}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className={`feedback${isRight ? ' good' : ' bad'}`} role="status">
          <div>
            <strong>{isRight ? (initialPicked ? 'You got this one right.' : `Correct! +${XP.correct} XP`) : 'Not quite.'}</strong>
            {!isRight && <><p><strong>Remember:</strong> {right}</p>{word.examples[0] && <p>“{word.examples[0]}”</p>}</>}
          </div>
          <button type="button" className="s-btn primary" onClick={onNext} autoFocus={!initialPicked}>
            Continue
            <Icon kind="arrow" />
          </button>
        </div>
      )}
    </div>
  );
}

function RecallCard({
  word,
  language,
  thesaurus,
  result,
  onAnswer,
}: {
  word: StudyWord;
  language: Language;
  thesaurus: ThesaurusId;
  result?: Result;
  onAnswer: (correct: boolean) => void;
}) {
  const { word: resolved, loading } = useWord(word);
  const [open, setOpen] = useState(!!result);
  return (
    <div className={`card study-card${open ? ' open' : ''}`}>
      <p className="eyebrow accent">
        <Icon kind="repeat" /> Do you remember?
      </p>
      <WordHead word={word} resolved={resolved} language={language} showTongue={open} thesaurus={thesaurus} />
      {open ? (
        <>
          <WordReveal word={word} resolved={resolved} language={language} loading={loading} />
          {result ? (
            <p className="recall-said">You answered: {result.outcome === 'correct' ? 'I knew it' : 'Not yet'}</p>
          ) : (
            <div className="recall-actions card-actions">
              <button
                type="button"
                className="s-btn ghost lg"
                onClick={() => {
                  playCue('miss');
                  onAnswer(false);
                }}
              >
                Not yet
              </button>
              <button
                type="button"
                className="s-btn primary lg"
                onClick={() => {
                  playCue('ok');
                  onAnswer(true);
                }}
              >
                <Icon kind="check" />I knew it
              </button>
            </div>
          )}
        </>
      ) : (
        <button type="button" className="s-btn primary lg block" onClick={() => setOpen(true)}>
          Show meaning
          <Icon kind="arrow" />
        </button>
      )}
    </div>
  );
}

type Tally = { learned: number; correct: number; reviews: number; xp: number };

function Summary({
  tally,
  data,
  onHome,
  onAgain,
  onBack,
  skipped,
  onSkipped,
}: {
  skipped: number;
  onSkipped: () => void;
  tally: Tally;
  data: LearnerData;
  onHome: () => void;
  onAgain: () => void;
  onBack: () => void;
}) {
  const streak = streakOf(data.activity);
  const accuracy = tally.reviews ? Math.round((tally.correct / tally.reviews) * 100) : null;
  const title = skipped ? 'Round paused' : accuracy === 100 ? 'Flawless round!' : tally.learned + tally.reviews > 0 ? 'Session complete' : 'See you soon';
  return (
    <div className="card summary-card">
      <div className="summary-burst" aria-hidden="true">
        <Icon kind="star" />
      </div>
      <h1>{title}</h1>
      <p className="summary-context">{tally.learned + tally.reviews} {tally.learned + tally.reviews === 1 ? "card" : "cards"} answered · {skipped} skipped</p>
      <p className="summary-xp">
        +{tally.xp} <span>XP</span>
      </p>
      <dl className="summary-stats">
        <div>
          <dt>New words</dt>
          <dd>{tally.learned}</dd>
        </div>
        <div>
          <dt>Reviews</dt>
          <dd>
            {tally.correct}/{tally.reviews}
          </dd>
        </div>
        <div>
          <dt>Streak</dt>
          <dd>
            {streak} {streak === 1 ? 'day' : 'days'}
          </dd>
        </div>
      </dl>
      <GoalRing value={learnedToday(data)} goal={data.profile.batchSize} size={112} />
      {skipped > 0 && <button type="button" className="s-btn primary lg" onClick={onSkipped}>Review {skipped} skipped {skipped === 1 ? "word" : "words"}</button>}
      <div className="summary-actions">
        <button type="button" className="s-btn ghost lg" onClick={onHome}>
          Back to hub
        </button>
        <button type="button" className={`s-btn ${skipped ? "ghost" : "primary"} lg`} onClick={onAgain}>
          Keep going
          <Icon kind="arrow" />
        </button>
      </div>
      <button type="button" className="summary-back" onClick={onBack}>
        <Icon kind="back" /> Look back at this round
      </button>
    </div>
  );
}

export function Session({
  data,
  items,
  onRecord,
  onExit,
  onAgain,
}: {
  data: LearnerData;
  items: SessionItem[];
  onRecord: (item: SessionItem, outcome: Outcome) => void;
  onExit: () => void;
  onAgain: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<number, Result>>({});
  const [tally, setTally] = useState<Tally>({ learned: 0, correct: 0, reviews: 0, xp: 0 });
  const [entries, setEntries] = useState<Map<string, WordEntry | null> | null>(null);
  const byId = useMemo(() => new Map(data.words.map((w) => [w.id, w])), [data.words]);
  // Fixed when the session starts so wrong answers don't change as progress updates.
  const [pool] = useState(() => distractorPool(items, data));

  useEffect(() => {
    let live = true;
    const lemmas = [
      ...items.map((i) => byId.get(i.wordId)?.lemma),
      ...(items.some((i) => i.kind === 'review') ? pool.map((w) => w.lemma) : []),
    ].filter((l): l is string => !!l);
    void entriesFor(lemmas).then((map) => {
      if (live) setEntries(map);
    });
    return () => {
      live = false;
    };
  }, [items, pool, byId]);

  const item = items[index];
  const word = item ? byId.get(item.wordId) : undefined;
  const result = results[index];
  const quiz = useMemo(() => {
    if (!entries || item?.kind !== 'review' || !word) return null;
    return quizOptions(word, pool, (w) => resolveStudy(w, entries.get(w.lemma)).primary);
  }, [entries, item, word, pool]);
  const done = index >= items.length;
  const revisiting = items.every(item => item.kind === 'revisit');
  const answered = Object.keys(results).length;
  const level = word && item?.kind === 'learn'
    ? levelsOf(data, word.bucket, data.profile.batchSize).find(level => level.words.some(entry => entry.id === word.id))
    : undefined;
  const counter = level
    ? `${level.words.findIndex(entry => entry.id === item.wordId) + 1}/${level.words.length}`
    : `${index + 1}/${items.length}`;

  function go(to: number) {
    setIndex(Math.max(0, Math.min(items.length, to)));
  }

  function record(outcome: Outcome, picked?: string) {
    if (!item || item.kind === 'revisit' || results[index]) return;
    onRecord(item, outcome);
    setResults((r) => ({ ...r, [index]: { outcome, picked } }));
    setTally((t) => ({
      learned: t.learned + (outcome === 'learned' ? 1 : 0),
      reviews: t.reviews + (outcome === 'learned' ? 0 : 1),
      correct: t.correct + (outcome === 'correct' ? 1 : 0),
      xp: t.xp + (outcome === 'learned' ? XP.learn : outcome === 'correct' ? XP.correct : XP.wrong),
    }));
  }

  useEffect(() => {
    if (done) return;
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'ArrowLeft' && index > 0) go(index - 1);
      else if (event.key === 'ArrowRight') go(index + 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!entries) {
    return (
      <section className="session">
        <div className="card study-card session-loading" aria-busy="true">
          <span className="spinner" aria-hidden="true" />
          <p>Getting your words ready…</p>
          <button type="button" className="s-btn ghost" onClick={onExit}>
            Cancel
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`session${done ? ' done' : ''}`}>
      <div className="session-main">
      <div className="session-stage">
        {done && revisiting ? (
          <section className="card study-card">
            <h2>Review complete</h2>
            <p>You revisited the learned words in this level.</p>
            <button type="button" className="s-btn primary" onClick={onAgain}>Continue to the next word</button>
            <button type="button" className="s-btn ghost" onClick={() => go(0)}>Look again</button>
          </section>
        ) : done ? (
          <Summary skipped={items.length - answered} onSkipped={() => go(items.findIndex((_, i) => !results[i]))} tally={tally} data={data} onHome={onExit} onAgain={onAgain} onBack={() => go(items.length - 1)} />
        ) : word && (item.kind === 'learn' || item.kind === 'revisit') ? (
          <LearnCard
            key={index}
            word={word}
            language={data.profile.language}
            thesaurus={data.profile.thesaurus}
            revisit={item.kind === 'revisit' || !!result}
            counter={counter}
            onDone={() => {
              record('learned');
              go(index + 1);
            }}
          />
        ) : word && quiz ? (
          <QuizCard
            key={index}
            word={word}
            right={quiz.right}
            options={quiz.options}
            initialPicked={result?.picked}
            onAnswer={(correct, picked) => record(correct ? 'correct' : 'wrong', picked)}
            onNext={() => go(index + 1)}
          />
        ) : word ? (
          <RecallCard
            key={index}
            word={word}
            language={data.profile.language}
            thesaurus={data.profile.thesaurus}
            result={result}
            onAnswer={(correct) => {
              record(correct ? 'correct' : 'wrong');
              go(index + 1);
            }}
          />
        ) : (
          <SkipMissing onSkip={() => go(index + 1)} />
        )}
      </div>

      {!done && (
        <nav className="session-nav" aria-label="Cards">
          <button type="button" className="s-btn ghost" onClick={() => go(index - 1)} disabled={index === 0}>
            <Icon kind="back" />
            Back
          </button>
          <button type="button" className="s-btn ghost" onClick={() => go(index + 1)}>
            {result || revisiting ? (index === items.length - 1 ? 'Finish' : 'Next') : 'Skip for now'}
            <Icon kind="next" />
          </button>
        </nav>
      )}
      </div>
      {!done && (
        <aside className="session-rail" aria-label="Session progress">
          <button type="button" className="s-icon-btn" onClick={onExit} aria-label="End session">
            <Icon kind="close" />
          </button>
          <span className="session-count">
            {counter}
          </span>
          <div className="session-progress" role="progressbar" aria-label="Answered cards" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={revisiting ? index : answered}>
            <span style={{ height: `${((revisiting ? index : answered) / items.length) * 100}%` }} />
          </div>
          <span className="session-xp">
            <Icon kind="sparkle" />
            {tally.xp}
          </span>
        </aside>
      )}
    </section>
  );
}

function SkipMissing({ onSkip }: { onSkip: () => void }) {
  useEffect(() => {
    onSkip();
  }, [onSkip]);
  return null;
}
