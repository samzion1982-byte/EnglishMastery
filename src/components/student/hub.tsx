'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useDialog } from '../use-dialog';
import { Icon } from '../icon';
import { GoalRing } from './goal-ring';
import { useWord } from './use-word';
import { BATCH_SIZES, type LearnerData, type StudyWord } from '@/lib/learner';
import { lookupStudyWord, type WordLookup } from '@/lib/word-lookup';
import {
  buildSession,
  learnedToday,
  trackSummaries,
  weekOf,
  wordOfDay,
  type TrackSummary,
  type WordLevel,
} from '@/lib/learner-stats';
import { pronounce } from '@/lib/speech';
import { bucketLabel, liveBuckets, type LiveBucket } from '@/lib/vocab';
import { GrammarLearning } from './grammar-learning';
import { SpeakingSection } from './speaking';
import { PracticeCorner } from './practice-corner';
import { AppendixBrowser } from './appendix-browser';
import { WordLook } from './word-look';
import { WordSearch } from './word-search';
import { TypeChips } from './word-view';
import { countAppendixItems } from '@/lib/appendix';
import { readAppendixCatalog } from '@/lib/appendix-cache';

export type Place = 'home' | 'vocab' | 'core' | 'practice' | 'grammar' | 'appendix' | 'speaking' | LiveBucket;

export type HubActions = {
  onPlace: (place: Place) => void;
  onToday: () => void;
  onLevel: (bucket: LiveBucket, level: WordLevel) => void;
  onReview: (bucket: LiveBucket) => void;
  onQuiz: (bucket: LiveBucket) => void;
  onBatchSize: (size: number) => void;
  onSwitch: (bucket: LiveBucket) => void;
  onAddedWord?: (word: StudyWord) => void;
  onGrammarAward?: (xp: number, completionOnly?: boolean) => void;
  onListenComplete?: () => void;
};

const TRACK_NOTE: Record<LiveBucket, string> = {
  beginner: 'Everyday words',
  intermediate: 'School & ideas',
  advanced: 'Exams & expression',
};

const CATEGORIES = [
  { id: 'vocab', title: 'Word Power', note: 'Core words by level, plus the Appendix', icon: 'book', tone: 'teal', live: true },
  { id: 'practice', title: 'Practice Corner', note: 'Write sentences or a story with words you choose', icon: 'notepad', tone: 'aqua', live: true },
  { id: 'grammar', title: 'Grammar Learning', note: 'Short lessons you can leave and come back to', icon: 'pen', tone: 'violet', live: true },
  { id: 'speaking', title: 'Speaking & Listening', note: 'Pronunciation and everyday talk', icon: 'mic', tone: 'coral', live: true },
  { id: 'idioms', title: 'Idioms & Phrases', note: 'Say it the way native speakers do', icon: 'chat', tone: 'gold' },
  { id: 'correct', title: 'Wrong vs Correct', note: 'Spot and fix common English mistakes', icon: 'swap', tone: 'indigo' },
  { id: 'resources', title: 'Learning Resources', note: 'Stories, guides and practice sheets', icon: 'library', tone: 'forest' },
];

function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function plural(n: number, one: string, many = `${one}s`) {
  return `${n.toLocaleString()} ${n === 1 ? one : many}`;
}

function Crumbs({ place, onPlace }: { place: Place; onPlace: (p: Place) => void }) {
  const trail: { place: Place; label: string }[] = [{ place: 'home', label: 'Home' }];
  if (place === 'practice') trail.push({ place: 'practice', label: 'Practice Corner' });
  else if (place === 'grammar') trail.push({ place: 'grammar', label: 'Grammar Learning' });
  else if (place === 'speaking') trail.push({ place: 'speaking', label: 'Speaking & Listening' });
  else if (place === 'appendix') {
    trail.push({ place: 'vocab', label: 'Word Power' });
    trail.push({ place: 'appendix', label: 'Appendix' });
  }
  else if (place !== 'home') trail.push({ place: 'vocab', label: 'Word Power' });
  if (place !== 'home' && place !== 'vocab' && place !== 'practice' && place !== 'grammar' && place !== 'appendix' && place !== 'speaking') trail.push({ place: 'core', label: 'Core Vocabulary' });
  if (liveBuckets.includes(place as LiveBucket)) trail.push({ place, label: bucketLabel[place as LiveBucket] });
  const parent = trail[trail.length - 2];
  return (
    <nav className="crumbs" aria-label="You are here">
      {parent && (
        <button type="button" className="s-icon-btn" onClick={() => onPlace(parent.place)} aria-label={`Back to ${parent.label}`}>
          <Icon kind="back" />
        </button>
      )}
      <ol>
        {trail.map((t, i) => (
          <li key={t.place}>
            {i === trail.length - 1 ? (
              <span aria-current="page">{t.label}</span>
            ) : (
              <button type="button" onClick={() => onPlace(t.place)}>
                {t.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Tile({
  icon,
  tone,
  title,
  note,
  meta,
  soon,
  onClick,
}: {
  icon: string;
  tone: string;
  title: string;
  note: string;
  meta?: ReactNode;
  soon?: boolean;
  onClick?: () => void;
}) {
  return (
    <button type="button" className={`card tile tone-${tone}${soon ? ' soon' : ' available'}`} onClick={onClick} disabled={soon || !onClick}>
      <span className="tile-orbit" aria-hidden="true"><i /><i /><i /></span>
      <span className="tile-icon">
        <Icon kind={icon} />
      </span>
      <span className="tile-body">
        <strong>{title}</strong>
        <span className="tile-note">{note}</span>
      </span>
      <span className="tile-foot">
        {soon ? (
          <span className="tile-soon">
            Coming soon
          </span>
        ) : (
          <>
            <span className="tile-meta">{meta}</span>
            <span className="tile-go">
              <Icon kind="next" />
            </span>
          </>
        )}
      </span>
    </button>
  );
}

function WordOfDay({ word }: { word: StudyWord }) {
  const { word: resolved, loading } = useWord(word);
  const example = resolved.senses.flatMap((s) => s.definitions).find((d) => d.example)?.example ?? word.examples[0];
  return (
    <section className="card wotd-card" aria-label="Word of the day">
      <div className="wotd-word">
        <div>
          <p className="eyebrow">Word of the day</p>
          <h2>{word.word}</h2>
        </div>
        <button type="button" className="s-icon-btn" aria-label={`Hear ${word.word}`} onClick={() => pronounce(word.word, resolved.phonetic)}>
          <Icon kind="sound" />
        </button>
      </div>
      <p className="wotd-pos">
        {resolved.phonetic && <span className="phonetic">{resolved.phonetic}</span>}
        <TypeChips types={resolved.types} />
      </p>
      {resolved.gist.length > 0 && <p className="wotd-gist">{resolved.gist.join(' · ')}</p>}
      <p className="wotd-meaning">{resolved.primary ?? (loading ? 'Looking up the meaning…' : 'No dictionary meaning found yet.')}</p>
      {example && <p className="wotd-example">“{example}”</p>}
    </section>
  );
}

function HomeTiles({
  data,
  onPlace,
  searchBusy,
  searchError,
  onFind,
}: {
  data: LearnerData;
  onPlace: (p: Place) => void;
  searchBusy: boolean;
  searchError: string;
  onFind: (query: string) => void;
}) {
  return (
    <>
      <div className="explore-heading"><h1>Find your next adventure</h1><span>Learn something new today</span></div>
      <WordSearch words={data.words} busy={searchBusy} error={searchError} onFind={onFind} />
      <div className="tiles">
        {CATEGORIES.map((c) => (
          <Tile
            key={c.id}
            icon={c.icon}
            tone={c.tone}
            title={c.title}
            note={c.note}
            soon={!c.live}
            meta={c.id === 'vocab' ? `${data.words.length.toLocaleString()} curated vocabulary` : c.id === 'grammar' ? '3 levels, your own place in each' : c.id === 'speaking' ? 'Choose a level, then listen or speak' : undefined}
            onClick={c.id === 'practice' ? () => onPlace('practice') : c.id === 'grammar' ? () => onPlace('grammar') : c.id === 'speaking' ? () => onPlace('speaking') : c.live ? () => onPlace('vocab') : undefined}
          />
        ))}
      </div>
    </>
  );
}

function VocabTiles({ data, onPlace }: { data: LearnerData; onPlace: (p: Place) => void }) {
  const [appendixCount, setAppendixCount] = useState<number | null>(null);
  useEffect(() => {
    let fresh = false;
    void readAppendixCatalog().then((cached) => {
      if (!fresh && cached) setAppendixCount(cached.items.length);
    });
    void countAppendixItems()
      .then((count) => {
        fresh = true;
        setAppendixCount(count);
      })
      .catch(() => undefined);
  }, []);
  return (
    <>
      <div className="section-head">
        <h1>Word Power</h1>
        <p>Build your word power one level at a time.</p>
      </div>
      <div className="tiles two">
        <Tile
          icon="layers"
          tone="teal"
          title="Core Vocabulary"
          note="Beginner, Intermediate and Advanced words"
          meta={plural(data.words.length, 'word')}
          onClick={() => onPlace('core')}
        />
        <Tile
          icon="bookmark"
          tone="gold"
          title="Appendix"
          note="Topic lists you can browse"
          meta={appendixCount == null ? 'Topic lists' : plural(appendixCount, 'word')}
          onClick={() => onPlace('appendix')}
        />
      </div>
    </>
  );
}

function CompleteBanner({ track, onChoose }: { track: TrackSummary; onChoose?: () => void }) {
  return (
    <section className={`card done-banner track-${track.bucket}`} role="status">
      <span className="done-medal">
        <Icon kind="star" />
      </span>
      <div>
        <h2>{bucketLabel[track.bucket]} complete</h2>
        <p>
          You finished all {plural(track.levels.length, 'level')} and {plural(track.total, 'word')}. Choose your next track to keep going.
        </p>
      </div>
      {onChoose && (
        <button type="button" className="s-btn primary" onClick={onChoose}>
          Choose next track
          <Icon kind="arrow" />
        </button>
      )}
    </section>
  );
}

function TrackTiles({ tracks, current, onOpen }: { tracks: TrackSummary[]; current: LiveBucket; onOpen: (b: LiveBucket) => void }) {
  const chosen = tracks.find((t) => t.bucket === current);
  return (
    <>
      <div className="section-head">
        <h1>Core Vocabulary</h1>
        <p>Choose any track. You can switch whenever you like, and the levels you complete stay completed.</p>
      </div>
      {chosen?.complete && <CompleteBanner track={chosen} />}
      <div className="tracks">
        {tracks.map((t, i) => (
          <button
            key={t.bucket}
            type="button"
            className={`card track track-${t.bucket}${t.bucket === current && !t.complete ? ' current' : ''}${t.complete ? ' complete' : ''}`}
            onClick={() => onOpen(t.bucket)}
            disabled={!t.total}
            aria-current={t.bucket === current ? 'true' : undefined}
          >
            <span className="track-step">{t.complete ? <Icon kind="check" /> : i + 1}</span>
            <span className="track-body">
              <span className="track-head">
                <strong>{bucketLabel[t.bucket]}</strong>
                {t.complete ? (
                  <span className="track-tag done">
                    <Icon kind="star" /> Completed
                  </span>
                ) : (
                  t.bucket === current && t.total > 0 && <span className="track-tag">Current track</span>
                )}
              </span>
              <span className="track-note">{TRACK_NOTE[t.bucket]}</span>
              <span className="bar" aria-hidden="true">
                <span style={{ width: `${t.percent}%` }} />
              </span>
              <span className="track-meta">
                {t.total
                  ? `${t.done} of ${plural(t.levels.length, 'level')} done · ${plural(t.total, 'word')}`
                  : 'No words yet'}
              </span>
            </span>
            <span className="track-pct">{t.total ? `${t.percent}%` : '–'}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function TrackView({ data, track, actions }: { data: LearnerData; track: TrackSummary; actions: HubActions }) {
  const size = data.profile.batchSize;
  const next = track.current;
  const learnedInScope = track.learned;
  const finished = track.complete;
  return (
    <>
      {finished && <CompleteBanner track={track} onChoose={() => actions.onPlace('core')} />}
      <section className={`card track-hero track-${track.bucket}`}>
        <div className="track-hero-copy">
          <p className="eyebrow">Core Vocabulary · {TRACK_NOTE[track.bucket]}</p>
          <h1>{bucketLabel[track.bucket]}</h1>
          <p className="track-hero-stat">
            {finished
              ? `All ${plural(track.levels.length, 'level')} complete. New words will appear here as they are added.`
              : next
                ? `Level ${next.number} of ${track.levels.length} · ${next.learned} of ${next.words.length} words learned`
                : 'No words yet.'}
          </p>
          <span className="bar lg" aria-hidden="true">
            <span style={{ width: `${track.percent}%` }} />
          </span>
          <p className="track-hero-meta">
            {learnedInScope.toLocaleString()} of {plural(track.total, 'word')} learned · {track.percent}%
          </p>
          <div className="track-actions">
            {next && (
              <button type="button" className="s-btn primary lg start-level" onClick={() => actions.onLevel(track.bucket, next)}>
                <Icon kind="play" />
                {next.learned ? `Continue level ${next.number}` : `Start level ${next.number}`}
              </button>
            )}
            <button type="button" className="s-btn ghost lg" onClick={() => actions.onReview(track.bucket)} disabled={!track.due}>
              <Icon kind="repeat" />
              Review{track.due ? ` · ${track.due}` : ''}
            </button>
            <button type="button" className="s-btn ghost lg" onClick={() => actions.onQuiz(track.bucket)} disabled={!learnedInScope}>
              <Icon kind="target" />
              Quick quiz
            </button>
          </div>
        </div>
      </section>

      <section className={`card levels-card track-${track.bucket}`} aria-labelledby="levels-title">
        <div className="card-title">
          <h2 id="levels-title">Levels</h2>
          <fieldset className="size-pick">
            <legend>Words per level</legend>
            <div className="seg-row">
              {BATCH_SIZES.map((n) => (
                <button key={n} type="button" className={n === size ? 'on' : undefined} aria-pressed={n === size} onClick={() => actions.onBatchSize(n)}>
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <p className="levels-note">Changing the size rebuilds your levels. Words you have learned stay learned.</p>
        <ol className="levels">
          {track.levels.map((l) => {
            const pct = Math.round((l.learned / l.words.length) * 100);
            const label =
              l.state === 'done'
                ? `Level ${l.number}, complete. Replay as a quiz.`
                : l.state === 'current'
                  ? `Level ${l.number}, ${l.learned} of ${l.words.length} learned`
                  : `Level ${l.number}, locked`;
            return (
              <li key={l.number}>
                <button
                  type="button"
                  className={`lvl ${l.state}`}
                  disabled={l.state === 'locked'}
                  onClick={() => actions.onLevel(track.bucket, l)}
                  aria-label={label}
                  title={label}
                  style={{ '--pct': `${pct}%` } as CSSProperties}
                >
                  <span className="lvl-num">{l.number}</span>
                  <span className="lvl-state">
                    {l.state === 'done' ? <Icon kind="check" /> : l.state === 'locked' ? <Icon kind="lock" /> : `${l.learned}/${l.words.length}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}

function AwardMark({ kind }: { kind: 'star' | 'cup' | 'medal' }) {
  if (kind === 'cup') {
    return (
      <svg className="award-mark award-cup" viewBox="0 0 24 24" aria-hidden="true">
        <path className="award-handle" fill="currentColor" d="M6.1 4.4H4.2A2.7 2.7 0 0 0 6.9 8.6V7.2A1.9 1.9 0 0 1 5.4 5.5h.7V4.4Zm11.8 0h1.9A2.7 2.7 0 0 1 17.1 8.6V7.2a1.9 1.9 0 0 0 1.5-1.7h-.7V4.4Z" opacity=".72" />
        <path className="award-body" fill="currentColor" d="M7.2 3.2h9.6v1.7c0 2.7-1.7 4.7-3.9 5.3v2.2h2c.4 0 .75.35.65.8l-.3 1.3H9.75l-.3-1.3c-.1-.45.25-.8.65-.8h1.9V10.2C8.9 9.6 7.2 7.6 7.2 4.9V3.2Z" />
        <path className="award-glint" fill="#fff8dc" d="M9.1 4.4h2c.1 1.2.6 2.1 1.4 2.7-1.4.3-2.5 1-3.2 1.9.1-1.5-.1-3-.2-4.6Z" />
      </svg>
    );
  }
  if (kind === 'medal') {
    return (
      <svg className="award-mark award-medal" viewBox="0 0 24 24" aria-hidden="true">
        <path className="award-ribbon" fill="#d7a441" d="M8 2.2h3.2L12 8.2 9.3 2.2H8Zm4.8 0H16L13.4 8.4 12.6 2.2h.2Z" />
        <circle className="award-disc" cx="12" cy="14.8" r="5.4" fill="currentColor" />
        <circle cx="12" cy="14.8" r="3.6" fill="none" stroke="#fff6d0" strokeWidth=".7" />
        <path className="award-glint" fill="#fff6d0" d="m12 12 0.85 1.7 1.85.2-1.35 1.25.35 1.8L12 16l-1.7.95.35-1.8-1.35-1.25 1.85-.2Z" />
      </svg>
    );
  }
  return (
    <svg className="award-mark award-star" viewBox="0 0 24 24" aria-hidden="true">
      <path className="award-body" fill="currentColor" d="m12 2.2 2.55 5.3 5.85.75-4.3 4 1.1 5.75L12 15.4 6.8 18l1.1-5.75-4.3-4 5.85-.75Z" />
      <path className="award-glint" fill="#fff8dc" d="M12 5.6 13.4 8.6l3.3.4-2.4 2.2.65 3.2L12 12.9 9.05 14.4l.65-3.2L7.3 9l3.3-.4Z" />
    </svg>
  );
}

function ProgressPanel({
  data,
  tracks,
  actions,
  onOpen,
}: {
  data: LearnerData;
  tracks: TrackSummary[];
  actions: HubActions;
  onOpen: (b: LiveBucket) => void;
}) {
  const { profile } = data;
  const first = profile.name.split(/\s+/)[0] || 'there';
  const learned = learnedToday(data, Date.now(), profile.track);
  const session = buildSession('today', data);
  const daySize = profile.batchSize;
  const goalLeft = Math.max(0, daySize - learned);
  const week = weekOf(data.activity, data.profile.country);
  const weekXp = week.reduce((sum, d) => sum + d.xp, 0);
  const active = tracks.find((t) => t.bucket === profile.track && t.total);
  const level = active?.current ?? null;
  const featured = wordOfDay(data, profile.track);
  const awards = [
    { kind: 'star' as const, label: 'Star', on: learned > 0, title: learned ? `${learned} words today` : 'Learn a word today' },
    { kind: 'cup' as const, label: 'Cup', on: weekXp > 0, title: weekXp ? `${weekXp} XP this week` : 'Earn XP this week' },
    { kind: 'medal' as const, label: 'Medal', on: tracks.some((track) => track.complete && track.total), title: tracks.some((track) => track.complete) ? 'A track is complete' : 'Finish a track' },
  ];

  return (
    <aside className="dash-side" aria-label="Your progress">
      <section className="card today-mini">
        <header className="today-mini-header">
          <p className="eyebrow">{greeting()}</p>
        <div className="award-row" aria-label="Awards">
          {awards.map((award) => (
            <div key={award.kind} className={`award award-${award.kind}${award.on ? ' on' : ''}`} title={award.title}>
              <AwardMark kind={award.kind} />
              <span>{award.label}</span>
            </div>
          ))}
        </div>
        </header>
        <div className="today-mini-copy">
          <h2>{first}</h2>
          <p>
            {active && level
              ? `${bucketLabel[active.bucket]} · Level ${level.number} of ${active.levels.length}`
              : active
                ? `${bucketLabel[active.bucket]} complete`
                : 'No words yet'}
          </p>
          <p className="today-goal">
            {goalLeft
              ? `${learned} of ${daySize} new words today`
              : `Daily goal of ${daySize} done`}
          </p>
        </div>
        {level ? (
          <GoalRing value={learned} goal={daySize} size={96} label="words today" />
        ) : (
          <GoalRing value={learned} goal={daySize} size={96} />
        )}
        {active && level ? (
          <button type="button" className="s-btn primary block start-level" onClick={() => actions.onLevel(active.bucket, level)}>
            <Icon kind="play" />
            {level.learned ? `Continue level ${level.number}` : `Start level ${level.number}`}
          </button>
        ) : active?.complete && tracks.some((t) => !t.complete && t.total) ? (
          <button type="button" className="s-btn primary block" onClick={() => actions.onPlace('core')}>
            <Icon kind="star" />
            Choose your next track
          </button>
        ) : (
          <button type="button" className="s-btn primary block" onClick={actions.onToday} disabled={!session.length}>
            <Icon kind="play" />
            {session.length ? `Review · ${session.length} cards` : 'All done for now'}
          </button>
        )}
        <div className="today-week" aria-labelledby="week-title">
          <div className="card-title">
            <h2 id="week-title">This week</h2>
            <p>{weekXp} XP</p>
          </div>
          <ol className="week">
            {week.map((d) => (
              <li
                key={d.key}
                className={`${d.active ? 'on' : ''}${d.today ? ' today' : ''}${d.weekend ? ' weekend' : ''}${d.weekday === 0 ? ' sun' : ''}${d.weekday === 6 ? ' sat' : ''}`}
                title={`${d.name}: ${d.xp} XP`}
              >
                <span className="week-dot">{d.active ? d.xp : ''}</span>
                <span className="week-label">{d.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {featured && <WordOfDay word={featured} />}

      <section className="card progress-card" aria-labelledby="progress-title">
        <div className="card-title">
          <h2 id="progress-title">Long-term progress</h2>
          <p>{profile.batchSize} words per level</p>
        </div>
        <p className="progress-group">Learned levels · mastered words · review accuracy</p>
        <ul className="progress-list">
          {tracks.map((t) => (
            <li key={t.bucket}>
              <button
                type="button"
                className={`progress-row track-${t.bucket}${t.bucket === profile.track && !t.complete ? ' current' : ''}`}
                onClick={() => onOpen(t.bucket)}
                disabled={!t.total}
                aria-current={t.bucket === profile.track ? 'true' : undefined}
              >
                <span className="progress-top">
                  <strong>{bucketLabel[t.bucket]}</strong>
                  {t.complete ? (
                    <span className="track-tag done">
                      <Icon kind="star" /> Completed
                    </span>
                  ) : (
                    <span className="progress-pct">{t.total ? `${t.percent}%` : '–'}</span>
                  )}
                </span>
                <span className="bar" aria-hidden="true">
                  <span style={{ width: `${t.percent}%` }} />
                </span>
                <span className="progress-stats">
                  <span>
                    <b>
                      {t.done}/{t.levels.length}
                    </b>{' '}
                    levels
                  </span>
                  <span>
                    <b>{t.mastered.toLocaleString()}</b> mastered
                  </span>
                  <span>
                    <b>{t.score === null ? '–' : `${t.score}%`}</b> review accuracy
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function SwitchDialog({
  from,
  to,
  onCancel,
  onConfirm,
}: {
  from: TrackSummary | undefined;
  to: TrackSummary;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialog = useDialog<HTMLDivElement>(onCancel);
  const stay = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    stay.current?.focus();
  }, [onCancel]);

  const fromName = from ? bucketLabel[from.bucket] : null;
  const next = to.current;
  return (
    <div className="s-dialog-backdrop" onClick={onCancel}>
      <div
        className={`card s-dialog track-${to.bucket}`}
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="switch-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="s-dialog-icon">
          <Icon kind="swap" />
        </span>
        <h2 id="switch-title">Switch to {bucketLabel[to.bucket]}?</h2>
        {from && fromName && (
          <p>
            {from.complete
              ? `You completed ${fromName}. It stays marked as complete.`
              : `${fromName} keeps its progress: ${from.done} of ${plural(from.levels.length, 'level')} done. You can come back any time and carry on from level ${from.current?.number ?? 1}.`}
          </p>
        )}
        <p className="s-dialog-next">
          {to.complete
            ? `${bucketLabel[to.bucket]} is already complete. You can replay its levels as quizzes.`
            : next
              ? `${bucketLabel[to.bucket]} ${next.learned || to.done ? 'continues at' : 'starts at'} level ${next.number} of ${to.levels.length}.`
              : null}
        </p>
        <div className="s-dialog-actions">
          <button type="button" className="s-btn ghost" onClick={onConfirm}>
            Switch to {bucketLabel[to.bucket]}
          </button>
          <button type="button" className="s-btn primary" onClick={onCancel} ref={stay}>
            {fromName ? `Stay on ${fromName}` : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Hub({ data, place, actions }: { data: LearnerData; place: Place; actions: HubActions }) {
  const tracks = trackSummaries(data);
  const track = tracks.find((t) => t.bucket === place);
  const [pending, setPending] = useState<LiveBucket | null>(null);
  const [look, setLook] = useState<WordLookup | null>(null);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState('');
  const chosen = tracks.find((t) => t.bucket === data.profile.track);
  const target = tracks.find((t) => t.bucket === pending);
  const cancel = useCallback(() => setPending(null), []);

  async function findWord(raw: string) {
    const query = raw.trim();
    if (query.length < 2) return;
    setSearchBusy(true);
    setSearchError('');
    try {
      const hit = await lookupStudyWord(query, data.words);
      if (hit) setLook(hit);
      else setSearchError(`No details found for “${query}”.`);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Could not look up that word.');
    } finally {
      setSearchBusy(false);
    }
  }

  function openTrack(bucket: LiveBucket) {
    if (bucket === data.profile.track || data.mode === 'sample') actions.onPlace(bucket);
    else setPending(bucket);
  }

  return (
    <div className={`dash${place === 'practice' || place === 'grammar' || place === 'appendix' || place === 'speaking' ? ' solo' : ''}`}>
      <div className="dash-main">
        {data.mode === 'sample' && (
          <p className="s-banner" role="status">
            <Icon kind="sparkle" />
            You&apos;re trying 5 sample words. Your full word list appears here once your teacher publishes it.
          </p>
        )}
        {place !== 'home' && <Crumbs place={place} onPlace={actions.onPlace} />}
        {place === 'practice' ? (
          <PracticeCorner data={data} onExit={() => actions.onPlace('home')} />
        ) : place === 'grammar' ? (
          <GrammarLearning key={data.userId ?? 'guest'} userId={data.userId} onPractice={() => actions.onPlace('practice')} onAward={(xp, completionOnly) => actions.onGrammarAward?.(xp, completionOnly)} />
        ) : place === 'speaking' ? (
          <SpeakingSection words={data.words} progress={data.progress} onListenComplete={actions.onListenComplete} />
        ) : place === 'home' ? (
          <HomeTiles data={data} onPlace={actions.onPlace} searchBusy={searchBusy} searchError={searchError} onFind={(q) => void findWord(q)} />
        ) : place === 'vocab' ? (
          <VocabTiles data={data} onPlace={actions.onPlace} />
        ) : place === 'appendix' ? (
          <AppendixBrowser language={data.profile.language} thesaurus={data.profile.thesaurus} />
        ) : place === 'core' || !track ? (
          <TrackTiles tracks={tracks} current={data.profile.track} onOpen={openTrack} />
        ) : (
          <TrackView data={data} track={track} actions={actions} />
        )}
      </div>
      {place !== 'practice' && place !== 'grammar' && place !== 'appendix' && place !== 'speaking' && <ProgressPanel data={data} tracks={tracks} actions={actions} onOpen={openTrack} />}
      {look && (
        <WordLook
          word={look.word}
          inRepo={look.inRepo}
          language={data.profile.language}
          thesaurus={data.profile.thesaurus}
          canAdd={!!data.canAddWords}
          onAdded={(word) => {
            setLook({ word, inRepo: true });
            actions.onAddedWord?.(word);
          }}
          onClose={() => setLook(null)}
        />
      )}
      {target && (
        <SwitchDialog
          from={chosen?.total ? chosen : undefined}
          to={target}
          onCancel={cancel}
          onConfirm={() => {
            setPending(null);
            actions.onSwitch(target.bucket);
          }}
        />
      )}
    </div>
  );
}
