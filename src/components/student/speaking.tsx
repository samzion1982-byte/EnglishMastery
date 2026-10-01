'use client';

import { useEffect, useId, useState } from 'react';
import { Icon } from '../icon';
import type { StudyWord } from '@/lib/learner';
import type { WordProgress } from '@/lib/srs';
import { readSpeakAward, type SpeakAward, type SpeakMedalName } from '@/lib/speaking-lines';
import { ListeningRound, readListenAward, useEnglishVoice, type ListenAward, type ListenMedalName } from './listening';
import { SpeakingRound } from './speaking-round';

type LevelId = 'beginner' | 'intermediate' | 'advanced';
type Skill = 'listen' | 'speak';

const LEVELS: { id: LevelId; title: string; note: string; icon: string }[] = [
  { id: 'beginner', title: 'Beginner', note: 'Five stories in one set.', icon: 'sparkle' },
  { id: 'intermediate', title: 'Intermediate', note: 'Longer sentences, said clearly.', icon: 'layers' },
  { id: 'advanced', title: 'Advanced', note: 'Connected speech at a natural pace.', icon: 'star' },
];

const METAL: Record<Exclude<ListenMedalName, 'Keep going'>, [string, string, string, string]> = {
  Gold: ['#fff8dc', '#f6c445', '#c4841a', '#6d4a08'],
  Silver: ['#ffffff', '#e7eef6', '#8ea0b8', '#3e4d61'],
  Bronze: ['#fff1e4', '#e7a56a', '#a85c28', '#5c3014'],
};

function MedalArt({ tone }: { tone: Exclude<ListenMedalName, 'Keep going'> }) {
  const id = useId().replace(/:/g, '');
  const [light, mid, deep, ink] = METAL[tone];
  return (
    <svg className="medal-art" viewBox="0 0 140 168" role="img" aria-label={`${tone} medal`}>
      <defs>
        <linearGradient id={`${id}-left`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id={`${id}-right`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffedd5" />
          <stop offset="1" stopColor="#c2410c" />
        </linearGradient>
        <radialGradient id={`${id}-face`} cx="36%" cy="30%" r="72%">
          <stop offset="0" stopColor={light} />
          <stop offset="0.46" stopColor={mid} />
          <stop offset="1" stopColor={deep} />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.45" stopColor={mid} />
          <stop offset="1" stopColor={ink} />
        </linearGradient>
      </defs>
      <path d="M46 4h18l10 50-19 12-19-12z" fill={`url(#${id}-left)`} />
      <path d="M76 4h18l10 50-19 12-19-12z" fill={`url(#${id}-right)`} />
      <path d="M58 46h24l-5 18H63z" fill={light} />
      <circle cx="70" cy="104" r="50" fill={`url(#${id}-rim)`} />
      <circle cx="70" cy="104" r="42" fill={`url(#${id}-face)`} />
      <circle cx="70" cy="104" r="34" fill="none" stroke="#fff" strokeOpacity="0.72" strokeWidth="1.6" />
      <ellipse cx="54" cy="86" rx="16" ry="9" fill="#fff" opacity="0.55" />
      <path fill="#fff" d="M70 78.2 73.6 86l8.4 1-6.2 5.8 1.6 8.2L70 96.8 62.6 101l1.6-8.2L58 87l8.4-1z" />
    </svg>
  );
}

function MedalBlank() {
  return (
    <svg className="medal-art is-blank" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff2e" strokeWidth="3" />
      <circle className="medal-ring-spin" cx="50" cy="50" r="40" fill="none" stroke="#ffffff66" strokeWidth="2.5" strokeDasharray="10 22" strokeLinecap="round" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="#ffffff24" strokeWidth="1.5" />
    </svg>
  );
}

function retakeLabel(medal: ListenMedalName | SpeakMedalName | undefined) {
  if (!medal) return 'Start the set';
  return medal === 'Gold' ? 'Retake the set' : 'Retake for Gold';
}

function MedalBoard({
  listen,
  speak,
  onListen,
  onSpeak,
  listenLocked,
}: {
  listen: ListenAward | null;
  speak: SpeakAward | null;
  onListen: () => void;
  onSpeak: () => void;
  listenLocked: boolean;
}) {
  const listenMetal = listen && listen.medal !== 'Keep going' ? listen.medal : null;
  const speakMetal = speak && speak.medal !== 'Keep going' ? speak.medal : null;
  return (
    <aside className="medal-board" aria-label="Your medals">
      <p className="medal-kicker">Your medals</p>
      <section className="medal-lane is-listen">
        <header>
          <span>Listening</span>
          {listen ? <strong>{listen.total} of {listen.max}</strong> : <strong>5 levels</strong>}
        </header>
        {listenMetal ? <MedalArt tone={listenMetal} /> : <MedalBlank />}
        <p>{listen ? listen.line : 'Finish the 5 levels to earn a medal.'}</p>
        <button type="button" className="s-btn medal-retake" onClick={onListen} disabled={listenLocked}>{retakeLabel(listen?.medal)}</button>
      </section>
      <section className="medal-lane is-speak">
        <header>
          <span>Speaking</span>
          {speak ? <strong>{speak.total} of {speak.max}</strong> : <strong>5 Levels</strong>}
        </header>
        {speakMetal ? <MedalArt tone={speakMetal} /> : <MedalBlank />}
        <p>{speak ? speak.line : 'Finish the 5 levels to earn a medal.'}</p>
        <button type="button" className="s-btn medal-retake" onClick={onSpeak}>{retakeLabel(speak?.medal)}</button>
      </section>
    </aside>
  );
}

export function SpeakingSection({ words, progress, onListenComplete }: { words: StudyWord[]; progress: Record<string, WordProgress>; onListenComplete?: () => void }) {
  const voice = useEnglishVoice();
  const [level, setLevel] = useState<LevelId | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [awardTick, setAwardTick] = useState(0);
  const [award, setAward] = useState<ListenAward | null>(null);
  const [speakAward, setSpeakAward] = useState<SpeakAward | null>(null);
  const chosen = LEVELS.find((item) => item.id === level);

  useEffect(() => {
    if (level !== 'beginner') {
      setAward(null);
      setSpeakAward(null);
      return;
    }
    setAward(readListenAward(level));
    setSpeakAward(readSpeakAward(level));
  }, [level, awardTick]);

  function pickLevel(id: LevelId) {
    setLevel(id);
    setSkill(null);
  }

  return (
    <section className="speak-page" aria-label="Speaking and listening">
      {!level && (
        <>
          <div className="section-head">
            <h1>Speaking & Listening</h1>
            <p>Choose the level you want to practise.</p>
          </div>
          <div className="speak-levels">
            {LEVELS.map((item) => (
              <button key={item.id} type="button" className={`speak-level speak-${item.id}`} onClick={() => pickLevel(item.id)}>
                <span className="speak-orb" aria-hidden="true"><Icon kind={item.icon} /></span>
                <strong>{item.title}</strong>
                <span>{item.note}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {level && chosen && !skill && (
        <div className={level === 'beginner' ? 'speak-choose' : 'speak-plain'}>
          <button type="button" className="s-btn ghost speak-back" onClick={() => setLevel(null)}>
            <Icon kind="back" /> All levels
          </button>
          <div className="speak-pick">
            <div className="speak-pick-copy">
              <p className="eyebrow">{chosen.title}</p>
              <h1>Choose a skill</h1>
            </div>
            <div className="speak-skills">
              <button type="button" className="speak-skill speak-listen" onClick={() => setSkill('listen')} disabled={voice === false}>
                <span className="speak-orb" aria-hidden="true">
                  <span className="speak-wave" />
                  <Icon kind="headphones" />
                </span>
                <strong>Listening</strong>
                <span>Hear a story, then pick the words.</span>
              </button>
              <button type="button" className="speak-skill speak-talk" onClick={() => setSkill('speak')}>
                <span className="speak-orb" aria-hidden="true">
                  <span className="speak-wave" />
                  <Icon kind="mic" />
                </span>
                <strong>Speaking</strong>
                <span>Five levels. Five new words in each.</span>
              </button>
            </div>
          </div>
          {level === 'beginner' && (
            <MedalBoard listen={award} speak={speakAward} listenLocked={voice === false} onListen={() => setSkill('listen')} onSpeak={() => setSkill('speak')} />
          )}
        </div>
      )}

      {voice === false && level && !skill && (
        <p className="listen-novoice">Listening needs a text-to-speech voice, which isn&apos;t available in this browser right now. Try Chrome or Edge.</p>
      )}

      {level && chosen && skill === 'listen' && (
        <ListeningRound level={level} title={chosen.title} onBack={() => { setSkill(null); setAwardTick((tick) => tick + 1); }} onComplete={onListenComplete} />
      )}

      {level === 'beginner' && chosen && skill === 'speak' && (
        <SpeakingRound words={words} learnedIds={new Set(Object.keys(progress))} onClose={() => { setSkill(null); setAwardTick((tick) => tick + 1); }} />
      )}

      {level && level !== 'beginner' && chosen && skill === 'speak' && (
        <div className="speak-stage">
          <button type="button" className="s-btn ghost" onClick={() => setSkill(null)}>
            <Icon kind="back" /> {chosen.title}
          </button>
          <p className="eyebrow">{chosen.title}</p>
          <h1>Speaking</h1>
          <p>You will hear a sentence, say it back, and see which words were recognized.</p>
        </div>
      )}
    </section>
  );
}
