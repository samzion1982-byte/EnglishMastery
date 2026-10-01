'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../icon';
import { dayKey } from '@/lib/learner';
import {
  LISTEN_INTRO,
  LISTEN_RATES,
  LISTEN_REPLAYS,
  passagesFor,
  pickPassage,
  type ListenPassage,
  type ListenQuestion,
  type ListenRise,
} from '@/lib/listening-passages';
import { playPassage, speechChunks, watchEnglishVoice, type PassagePlayer } from '@/lib/speech';
import type { LiveBucket } from '@/lib/vocab';

type Phase = 'play' | 'ask' | 'score' | 'read' | 'again' | 'final';

const STORY_REPLAYS = 2;

export type ListenMedalName = 'Gold' | 'Silver' | 'Bronze' | 'Keep going';
export type ListenAward = { medal: ListenMedalName; total: number; max: number; line: string };

const MEDAL_RANK: Record<ListenMedalName, number> = { 'Keep going': 0, Bronze: 1, Silver: 2, Gold: 3 };

function listenMedal(total: number, max: number): ListenAward {
  if (total >= max - 2) return { medal: 'Gold', total, max, line: 'Excellent listening. You caught almost every word.' };
  if (total >= Math.round(max * 0.72)) return { medal: 'Silver', total, max, line: 'Strong work. A few words to listen for again.' };
  if (total >= Math.round(max * 0.52)) return { medal: 'Bronze', total, max, line: 'Good start. Listen once more and the stars will fill.' };
  return { medal: 'Keep going', total, max, line: 'Play the stories again. The medal is waiting.' };
}

export function readListenAward(level: string): ListenAward | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`em-listen-medal:${level}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ListenAward;
    if (!parsed || typeof parsed.total !== 'number' || !(parsed.medal in MEDAL_RANK)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveListenAward(level: string, total: number, max: number) {
  const next = listenMedal(total, max);
  const prev = readListenAward(level);
  const better = !prev
    || MEDAL_RANK[next.medal] > MEDAL_RANK[prev.medal]
    || (next.medal === prev.medal && next.total >= prev.total);
  const kept = better ? next : prev;
  localStorage.setItem(`em-listen-medal:${level}`, JSON.stringify(kept));
  return kept;
}

function FinalListenScore({ stories, scores, onClose }: { stories: ListenPassage[]; scores: number[]; onClose: () => void }) {
  const max = stories.reduce((sum, story) => sum + (story.rises?.length ?? 0), 0);
  const total = scores.reduce((sum, score) => sum + score, 0);
  const medal = listenMedal(total, max || 1);
  const tone = medal.medal === 'Gold' ? 'gold' : medal.medal === 'Silver' ? 'silver' : medal.medal === 'Bronze' ? 'bronze' : 'plain';
  return (
    <>
      <p className="listen-score-kicker">Final score</p>
      <div className={`listen-medal ${tone}`}>{medal.medal}</div>
      <h2 id="listen-score-title">{total} of {max}</h2>
      <p className="listen-fraction">{medal.line}</p>
      <ul className="listen-set">
        {stories.map((story, index) => (
          <li key={story.id}>
            <span>{index + 1}/{stories.length}</span>
            <strong>{story.title}</strong>
            <em>{scores[index] ?? 0}/{story.rises?.length ?? 0}</em>
          </li>
        ))}
      </ul>
      <button type="button" className="s-btn primary" onClick={onClose}>Done</button>
    </>
  );
}
type Floater = {
  id: string;
  word: string;
  wave: string;
  correct: boolean;
  left: number;
  phase: number;
  tone: number;
  born: number;
  y: number;
  span: number;
  state: 'rise' | 'hit' | 'miss' | 'out' | 'gone';
};
type Pop = { id: string; left: number; bottom: number };

const POINTS = 10;
const RISE_MS = 12000;
const FLUSH_MS = 800;
const TAP_MS = 1600;
const HOLD_MS = 4200;

function flushWave(items: Floater[], wave: string, now: number, tappedId?: string, correct?: boolean) {
  return items.map((floater) => {
    if (floater.wave !== wave || floater.state !== 'rise') return floater;
    const span = Math.max(280, FLUSH_MS / Math.max(0.05, 1 - floater.y));
    const born = now - floater.y * span;
    if (tappedId && floater.id === tappedId) return { ...floater, state: correct ? 'hit' as const : 'miss' as const, span, born };
    return { ...floater, state: 'out' as const, span, born };
  });
}
const HEAR_CUE = 'Tap the word you hear. Rhymes float up with it.';
const COUNTDOWN = ['Listen carefully', 'Listen carefully', HEAR_CUE, HEAR_CUE, '5', '4', '3', '2', '1', 'Go!'];

function tokenIndex(chunks: string[], word: string) {
  let index = 0;
  const target = word.toLowerCase();
  for (const chunk of chunks) {
    for (const part of chunk.split(/\s+/)) {
      if (!part) continue;
      if (part.toLowerCase().replace(/[^a-z']/g, '') === target) return index;
      index += 1;
    }
  }
  return -1;
}

function riseSlots(rise: ListenRise) {
  const words = [rise.answer, ...rise.rhymes];
  let hash = 0;
  for (const char of rise.answer) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  for (let index = words.length - 1; index > 0; index -= 1) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    const swap = hash % (index + 1);
    [words[index], words[swap]] = [words[swap], words[index]];
  }
  return words;
}

function mixChoices(question: ListenQuestion) {
  const list = [question.answer, ...question.distractors];
  let hash = 0;
  for (const char of question.id) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  for (let index = list.length - 1; index > 0; index -= 1) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    const swap = hash % (index + 1);
    [list[index], list[swap]] = [list[swap], list[index]];
  }
  return list;
}

export function ListeningRound({
  level,
  title,
  onBack,
  onComplete,
}: {
  level: LiveBucket;
  title: string;
  onBack: () => void;
  onComplete?: () => void;
}) {
  const stories = useMemo(() => (level === 'beginner' ? passagesFor('beginner') : []), [level]);
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyScores, setStoryScores] = useState<number[]>([]);
  const [triesLeft, setTriesLeft] = useState(STORY_REPLAYS);
  const [passage, setPassage] = useState<ListenPassage | null>(null);
  const chunks = useMemo(() => (passage ? speechChunks(passage.text) : []), [passage]);
  const [phase, setPhase] = useState<Phase>('play');
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [replaysLeft, setReplaysLeft] = useState<number | null>(LISTEN_REPLAYS[level]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [points, setPoints] = useState(0);
  const [caught, setCaught] = useState<string[]>([]);
  const caughtRef = useRef<string[]>([]);
  const [cue, setCue] = useState<string | null>(null);
  const [pops, setPops] = useState<Pop[]>([]);
  const cueRef = useRef<string | null>(null);
  const cueDone = useRef(false);
  const player = useRef<PassagePlayer | null>(null);
  const scored = useRef(false);
  const spawned = useRef(new Set<string>());
  const floatersRef = useRef<Floater[]>([]);
  const clock = useRef({ origin: 0, frozen: 0, pausing: 0 });
  const spoken = useRef(-1);
  const pendingAudio = useRef(false);

  useEffect(() => {
    if (level === 'beginner') {
      const bank = passagesFor('beginner');
      setStoryIndex(0);
      setStoryScores(bank.map(() => 0));
      setTriesLeft(STORY_REPLAYS);
      setPassage(bank[0] ?? null);
      return;
    }
    const next = pickPassage(level, sessionStorage.getItem(`em-listen-last:${level}`));
    sessionStorage.setItem(`em-listen-last:${level}`, next.id);
    setPassage(next);
  }, [level]);

  useEffect(() => () => player.current?.stop(), []);

  function stop() {
    player.current?.stop();
    player.current = null;
    setPlaying(false);
    setPaused(false);
  }

  function attachPlayer() {
    if (player.current) return;
    player.current = playPassage(chunks, LISTEN_RATES[level], {
      onProgress: setProgress,
      onWord: (index) => {
        spoken.current = Math.max(spoken.current, index);
      },
      onEnd: () => {
        spoken.current = Math.max(spoken.current, 100000);
        setPlaying(false);
        setPaused(false);
        setProgress(1);
        setFinished(true);
      },
    });
  }

  function start(countsAsReplay: boolean) {
    if (countsAsReplay && replaysLeft === 0) return;
    pendingAudio.current = false;
    stop();
    clock.current = { origin: 0, frozen: 0, pausing: 0 };
    if (countsAsReplay && replaysLeft !== null) setReplaysLeft((left) => (left === null ? null : Math.max(0, left - 1)));
    setProgress(0);
    setFinished(false);
    setPaused(false);
    setPlaying(true);
    clock.current = { origin: performance.now(), frozen: 0, pausing: 0 };
    spoken.current = -1;
    scored.current = false;
    spawned.current.clear();
    floatersRef.current = [];
    setFloaters([]);
    setPoints(0);
    caughtRef.current = [];
    setCaught([]);
    setPops([]);
    cueRef.current = null;
    cueDone.current = false;
    setCue(null);
    if (level === 'beginner') pendingAudio.current = true;
    else attachPlayer();
  }

  function toggle() {
    if (!playing && !paused) {
      start(phase === 'play' && finished);
      return;
    }
    if (paused) {
      if (clock.current.pausing) {
        clock.current.frozen += performance.now() - clock.current.pausing;
        clock.current.pausing = 0;
      }
      player.current?.resume();
      setPaused(false);
      setPlaying(true);
      return;
    }
    clock.current.pausing = performance.now();
    player.current?.pause();
    setPaused(true);
    setPlaying(false);
  }

  function elapsedNow() {
    if (!clock.current.origin) return 0;
    const end = clock.current.pausing || performance.now();
    return Math.max(0, end - clock.current.origin - clock.current.frozen);
  }

  useEffect(() => {
    if (level !== 'beginner' || phase !== 'play' || !passage?.rises) return;
    const rises = passage.rises;
    const marks = rises.map((rise) => tokenIndex(chunks, rise.answer));
    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      const settling = floatersRef.current.some((item) => item.state !== 'gone');
      if (!playing && !paused && !settling) return;
      if (!clock.current.origin) return;
      const ms = elapsedNow();
      let changed = false;
      let fresh = floatersRef.current.slice();
      const rising = fresh.filter((item) => item.state === 'rise');
      if (rising.length) {
        const age = ms - Math.min(...rising.map((item) => item.born));
        const nextDue = rises.some((rise, index) => !spawned.current.has(rise.answer) && marks[index] >= 0 && spoken.current >= marks[index]);
        if (age >= HOLD_MS || (nextDue && age >= TAP_MS)) {
          fresh = flushWave(fresh, rising[0].wave, ms);
          changed = true;
        }
      }
      const busy = fresh.some((item) => item.state !== 'gone');
      if (!busy) {
        const wave = rises.findIndex((rise, index) => !spawned.current.has(rise.answer) && marks[index] >= 0 && spoken.current >= marks[index]);
        if (wave >= 0) {
          const rise = rises[wave];
          spawned.current.add(rise.answer);
          changed = true;
          riseSlots(rise).forEach((word, index) => {
            fresh.push({
              id: `${rise.answer}-${word}-${wave}`,
              word,
              wave: rise.answer,
              correct: word === rise.answer,
              left: 50 + (index - 1) * 6,
              phase: index * 2.2 + wave,
              tone: index,
              born: ms,
              y: 0,
              span: RISE_MS,
              state: 'rise',
            });
          });
        }
      }
      const moved = fresh.map((item): Floater => {
        if (item.state === 'gone') return item;
        const y = Math.min(1, Math.max(0, (ms - item.born) / item.span));
        const state: Floater['state'] = y >= 1 ? 'gone' : item.state;
        if (Math.abs(y - item.y) < 0.002 && state === item.state) return item;
        changed = true;
        return { ...item, y, state };
      });
      if (changed) {
        floatersRef.current = moved;
        setFloaters(moved);
      }
      if (spawned.current.size > 0) cueDone.current = true;
      const step = Math.floor(ms / 700);
      if (pendingAudio.current && !player.current && step >= COUNTDOWN.length) {
        pendingAudio.current = false;
        attachPlayer();
      }
      const nextCue = cueDone.current || step >= COUNTDOWN.length ? null : COUNTDOWN[step];
      if (nextCue !== cueRef.current) {
        cueRef.current = nextCue;
        setCue(nextCue);
      }
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [level, phase, passage, chunks, playing, paused]);

  useEffect(() => {
    if (level !== 'beginner' || phase !== 'play' || !finished || !passage?.rises) return;
    if (spawned.current.size < passage.rises.length) return;
    if (floaters.length === 0 || floaters.some((item) => item.state !== 'gone')) return;
    if (scored.current) return;
    scored.current = true;
    player.current?.stop();
    setPlaying(false);
    setPaused(false);
    setStoryScores((previous) => {
      const next = previous.slice();
      const hits = caughtRef.current.length;
      next[storyIndex] = Math.max(next[storyIndex] ?? 0, hits);
      return next;
    });
    setPhase('score');
    const key = `em-listen-day:${dayKey()}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, '1');
      onComplete?.();
    }
  }, [level, phase, finished, passage, floaters, onComplete, storyIndex]);

  function tapRise(item: Floater) {
    if (item.state !== 'rise') return;
    const next = flushWave(floatersRef.current, item.wave, elapsedNow(), item.id, item.correct);
    floatersRef.current = next;
    setFloaters(next);
    if (!item.correct) return;
    const pop = { id: `${item.id}-pop`, left: item.left, bottom: 8 + item.y * 80 };
    setPops((list) => [...list, pop]);
    window.setTimeout(() => setPops((list) => list.filter((entry) => entry.id !== pop.id)), 900);
    setPoints((score) => score + POINTS);
    setCaught((list) => {
      if (list.includes(item.wave)) return list;
      const next = [...list, item.wave];
      caughtRef.current = next;
      return next;
    });
  }

  function replayStory() {
    if (triesLeft <= 0) return;
    setTriesLeft((left) => left - 1);
    setPhase('play');
    start(false);
  }

  useEffect(() => {
    if (phase !== 'final' || level !== 'beginner' || stories.length === 0) return;
    const max = stories.reduce((sum, story) => sum + (story.rises?.length ?? 0), 0);
    const total = storyScores.reduce((sum, score) => sum + score, 0);
    if (max > 0) saveListenAward(level, total, max);
  }, [phase, level, stories, storyScores]);

  function goNext() {
    stop();
    if (storyIndex >= stories.length - 1) {
      const max = stories.reduce((sum, story) => sum + (story.rises?.length ?? 0), 0);
      const total = storyScores.reduce((sum, score) => sum + score, 0);
      if (max > 0) saveListenAward(level, total, max);
      setPhase('final');
      return;
    }
    const next = storyIndex + 1;
    scored.current = false;
    caughtRef.current = [];
    setCaught([]);
    setPoints(0);
    setFinished(false);
    setProgress(0);
    setPlaying(false);
    setPaused(false);
    setFloaters([]);
    floatersRef.current = [];
    spawned.current.clear();
    spoken.current = -1;
    clock.current = { origin: 0, frozen: 0, pausing: 0 };
    setTriesLeft(STORY_REPLAYS);
    setStoryIndex(next);
    setPassage(stories[next] ?? null);
    setPhase('play');
  }

  function choose(word: string) {
    if (!passage) return;
    const next = [...picks, word];
    setPicks(next);
    if (questionIndex + 1 < passage.questions.length) {
      setQuestionIndex((index) => index + 1);
      return;
    }
    stop();
    setPhase('score');
    if (scored.current) return;
    scored.current = true;
    const key = `em-listen-day:${dayKey()}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, '1');
      onComplete?.();
    }
  }

  if (!passage) return null;

  const correct = picks.filter((pick, index) => pick === passage.questions[index]?.answer).length;
  const question = passage.questions[questionIndex];
  const choices = question ? mixChoices(question) : [];
  const replayLabel = replaysLeft === null ? 'Replay' : replaysLeft === 1 ? '1 replay left' : `${replaysLeft} replays left`;

  return (
    <section className="listen-round" aria-label={`${title} listening`}>
      <div className={`speak-bar${level === 'beginner' && phase === 'play' ? ' listen-head' : ''}`}>
        <div className="listen-title">
          <p className="eyebrow">{title} Listening</p>
          <h1>{phase === 'final' ? 'Final score' : phase === 'score' || phase === 'read' || phase === 'again' ? 'Your score' : passage.title}</h1>
        </div>
        <div className="listen-head-actions">
          <button type="button" className="s-btn ghost" onClick={() => { stop(); onBack(); }}>
            <Icon kind="back" /> {phase === 'play' ? 'Skills' : 'Back'}
          </button>
          {level === 'beginner' && phase === 'play' && (
            <button type="button" className="s-btn ghost" onClick={() => start(finished)} disabled={finished && replaysLeft === 0}>
              {replayLabel}
            </button>
          )}
        </div>
      </div>

      {phase === 'play' && level === 'beginner' && (
        <div className="listen-arcade">
          <div className="listen-arcade-bar">
            <button type="button" className="listen-play sm" onClick={toggle} aria-label={playing ? 'Pause' : paused ? 'Resume' : 'Play'}>
              <Icon kind={playing ? 'pause' : 'play'} />
            </button>
            <div className="listen-track" aria-hidden="true">
              <span style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <p className="listen-points"><b key={points}>{points}</b> points</p>
          </div>
          <div className={`listen-stage${paused ? ' is-paused' : ''}${playing ? ' is-live' : ''}`}>
            {cue && (
              <div className={`listen-cue${cue === 'Go!' ? ' is-go' : ''}${cue === 'Listen carefully' || cue === HEAR_CUE ? ' is-listen' : ''}`} key={cue}>
                <strong>{cue}</strong>
              </div>
            )}
            {floaters.filter((item) => item.state !== 'gone').map((item) => {
              const sway = Math.sin(item.y * Math.PI * 2.6 + item.phase) * 32;
              const x = Math.min(86, Math.max(14, item.left + sway));
              const fade = item.y < 0.78 ? 1 : Math.max(0, 1 - (item.y - 0.78) / 0.22);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`listen-floater tone-${item.tone} ${item.state}`}
                  style={{ left: `${x}%`, bottom: `${item.y * 112 - 6}%`, opacity: item.state === 'miss' ? fade * 0.35 : fade, transform: `translateX(-50%) rotate(${sway * 0.25}deg)` }}
                  onClick={() => tapRise(item)}
                >
                  {item.word}
                </button>
              );
            })}
            {pops.map((pop) => (
              <span key={pop.id} className="listen-pop" style={{ left: `${pop.left}%`, bottom: `${pop.bottom}%` }}>+{POINTS}</span>
            ))}
          </div>
        </div>
      )}

      {phase === 'play' && level !== 'beginner' && question && (
        <div className="listen-live">
          <div className="listen-player">
            <p className="listen-intro">{LISTEN_INTRO[level]}</p>
            <button type="button" className="listen-play" onClick={toggle} aria-label={playing ? 'Pause' : paused ? 'Resume' : 'Play'}>
              <Icon kind={playing ? 'pause' : 'play'} />
              {playing ? 'Pause' : paused ? 'Resume' : 'Play'}
            </button>
            <div className="listen-track" aria-hidden="true">
              <span style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <button type="button" className="s-btn ghost" onClick={() => start(finished)} disabled={finished && replaysLeft === 0}>
              {replayLabel}
            </button>
          </div>
          <div className="listen-ask">
            <p className="listen-count">Question {questionIndex + 1} of {passage.questions.length}</p>
            <h2>{question.prompt}</h2>
            <div className="listen-choices">
              {choices.map((choice) => (
                <button key={choice} type="button" className="listen-choice" onClick={() => choose(choice)}>
                  {choice}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'play' && level === 'beginner' && stories.length > 0 && (
        <p className="listen-story-pip" aria-label={`Story ${storyIndex + 1} of ${stories.length}`}>{storyIndex + 1}/{stories.length}</p>
      )}

      {(phase === 'score' || phase === 'read' || phase === 'final') && createPortal(
        <div className="listen-score-backdrop">
          <div className="listen-score-modal" role="dialog" aria-modal="true" aria-labelledby="listen-score-title">
            {phase === 'final' && (
              <FinalListenScore stories={stories} scores={storyScores} onClose={() => { stop(); onBack(); }} />
            )}
            {phase === 'score' && level === 'beginner' && passage.rises && (
              <>
                <p className="listen-score-kicker">Story {storyIndex + 1}/{stories.length}</p>
                <div className="listen-stars" aria-label={`${caught.length} of ${passage.rises.length} stars`}>
                  {passage.rises.map((item) => (
                    <span key={item.answer} className={caught.includes(item.answer) ? 'on' : ''}>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.2 2.8 5.8 6.4.8-4.7 4.5 1.2 6.3L12 16.6 6.3 19.6l1.2-6.3L2.8 8.8l6.4-.8Z" /></svg>
                    </span>
                  ))}
                </div>
                <p className="listen-fraction">{caught.length} of {passage.rises.length} stars</p>
                {(storyScores[storyIndex] ?? 0) > caught.length ? <p className="listen-note">Best kept: {storyScores[storyIndex]} stars</p> : <p className="listen-note">Review the words below.</p>}
                <ul className="listen-review">
                  {passage.rises.map((item) => {
                    const right = caught.includes(item.answer);
                    return (
                      <li key={item.answer} className={right ? 'right' : 'wrong'}>
                        <strong>{item.answer}</strong>
                        <span>{right ? 'Star' : 'Missed'}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="listen-actions">
                  <button type="button" className="s-btn listen-pill read" onClick={() => setPhase('read')}>Read the passage</button>
                  {triesLeft > 0 ? (
                    <button type="button" className="s-btn listen-pill replay" onClick={replayStory}>Replay · {triesLeft} left</button>
                  ) : null}
                  <button type="button" className="s-btn listen-pill next" onClick={goNext}>{storyIndex + 1 < stories.length ? 'Next story' : 'Final score'}</button>
                </div>
              </>
            )}
            {phase === 'score' && !(level === 'beginner' && passage.rises) && (
              <>
                <p className="listen-score-kicker">Your score</p>
                <h2 id="listen-score-title" className="listen-score-num">{passage.rises ? points : `${Math.round((correct / passage.questions.length) * 100)}%`}</h2>
                <p className="listen-fraction">{passage.rises ? `You scored ${points} points.` : `You identified ${correct} out of ${passage.questions.length} words correctly.`}</p>
                <p className="listen-note">Review the words below.</p>
                <ul className="listen-review">
                  {passage.rises
                    ? passage.rises.map((item) => {
                        const right = caught.includes(item.answer);
                        return (
                          <li key={item.answer} className={right ? 'right' : 'wrong'}>
                            <strong>{item.answer}</strong>
                            <span>{right ? `Hit  +${POINTS}` : 'Missed'}</span>
                          </li>
                        );
                      })
                    : passage.questions.map((item, index) => {
                        const picked = picks[index];
                        const right = picked === item.answer;
                        return (
                          <li key={item.id} className={right ? 'right' : 'wrong'}>
                            <span>{right ? 'Correct' : 'Missed'}</span>
                            <strong>Word said: {item.answer}</strong>
                            <em>Your answer: {picked}</em>
                          </li>
                        );
                      })}
                </ul>
                <div className="listen-actions">
                  <button type="button" className="s-btn ghost" onClick={() => setPhase('read')}>Read the passage</button>
                  <button type="button" className="s-btn primary" onClick={() => { setPhase(passage.rises ? 'play' : 'again'); start(false); }}>Replay</button>
                </div>
              </>
            )}
            {phase === 'read' && (
              <>
                <h2 id="listen-score-title">The story</h2>
                <p className="listen-transcript">{passage.text}</p>
                <button type="button" className="s-btn ghost" onClick={() => setPhase('score')}>Back to score</button>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}

      {phase === 'again' && (
        <div className="listen-score">
          <button type="button" className="listen-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
            <Icon kind={playing ? 'pause' : 'play'} />
            {playing ? 'Pause' : 'Play'}
          </button>
          <div className="listen-track" aria-hidden="true">
            <span style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <button type="button" className="s-btn ghost" onClick={() => { stop(); setPhase('score'); }}>Back to score</button>
        </div>
      )}
    </section>
  );
}

export function useEnglishVoice() {
  const [ready, setReady] = useState<boolean | null>(null);
  useEffect(() => watchEnglishVoice(setReady), []);
  return ready;
}
