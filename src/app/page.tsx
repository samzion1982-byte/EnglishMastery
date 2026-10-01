'use client';

import { useNotice } from '@/components/use-notice';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Hub, type HubActions, type Place } from '@/components/student/hub';
import { ProfileView } from '@/components/student/profile';
import { Session, type Outcome } from '@/components/student/session';
import { TopBar } from '@/components/student/top-bar';
import { applyDelta, clampTodayLearned, dayKey, loadLearner, recordActivity, recordItem, resetProgress, saveProfile, type LearnerData, type LearnerProfile, type ResetScope } from '@/lib/learner';
import { buildSession, learnedToday, levelSession, revisitLevel, levelsOf, streakOf, trackSummary, type SessionItem } from '@/lib/learner-stats';
import { learnedNow, reviewed, XP } from '@/lib/srs';
import type { LiveBucket } from '@/lib/vocab';
import { setEntryOwner, warmEntries } from '@/lib/word-store';

type View = 'home' | 'session' | 'profile';
type Builder = { build: (data: LearnerData) => SessionItem[]; empty: string; next?: Builder };

export default function Home() {
  const [data, setData] = useState<LearnerData | null>(null);
  const [view, setViewState] = useState<View>('home');
  const [place, setPlaceState] = useState<Place>('home');
  const location = useRef<{ view: View; place: Place }>({ view: 'home', place: 'home' });
  const [items, setItems] = useState<SessionItem[]>([]);
  const [sessionId, setSessionId] = useState(0);
  const [notice, setNotice, noticeTone] = useNotice('');
  const last = useRef<Builder | null>(null);

  function navigate(next: { view: View; place: Place }, replace = false) {
    location.current = next;
    setViewState(next.view);
    setPlaceState(next.place);
    const params = new URLSearchParams();
    if (next.place !== 'home') params.set('place', next.place);
    if (next.view !== 'home') params.set('view', next.view);
    const url = '/' + (params.size ? '?' + params.toString() : '');
    if (window.location.pathname + window.location.search !== url) window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
  }
  function setView(view: View) { navigate({ ...location.current, view }); }
  function setPlace(place: Place) { navigate({ view: 'home', place }); }
  useEffect(() => {
    function restore() {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('place');
      const place: Place = ['home', 'vocab', 'core', 'practice', 'grammar', 'appendix', 'speaking', 'beginner', 'intermediate', 'advanced'].includes(raw ?? '') ? raw as Place : 'home';
      const view: View = params.get('view') === 'profile' ? 'profile' : 'home';
      if (params.get('view') === 'session') setNotice('Your saved answers are kept. Continue your track to start a fresh round.');
      navigate({ view, place }, true);
    }
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  useEffect(() => {
    let live = true;
    void loadLearner().then((loaded) => {
      if (!live) return;
      setData(loaded);
      if (!loaded.fromCache) return;
      void loadLearner({ skipCache: true }).then((fresh) => {
        if (live && fresh.mode === 'live' && !fresh.fromCache) setData(fresh);
      });
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view, sessionId, place]);

  useEffect(() => {
    if (!data) return;
    setEntryOwner(data.userId);
    if (!data.profile.localCache) return;
    const lemmas = data.words.filter((w) => w.bucket === data.profile.track).map((w) => w.lemma);
    warmEntries(lemmas);
  }, [data?.userId, data?.profile.track, data?.profile.localCache, data?.words]);

  const totals = useMemo(() => {
    if (!data) return { streak: 0, xp: 0 };
    return { streak: streakOf(data.activity), xp: data.activity.reduce((sum, a) => sum + a.xp, 0) };
  }, [data]);

  function run(builder: Builder, source = data) {
    if (!source) return;
    const list = builder.build(source);
    if (!list.length) {
      setNotice(builder.empty);
      setView('home');
      return;
    }
    last.current = builder;
    setNotice('');
    setItems(list);
    setSessionId((n) => n + 1);
    setView('session');
  }

  function remember(profile: LearnerProfile) {
    if (!data) return;
    setData({ ...data, profile });
    saveProfile(data, profile).catch(() => setNotice('Your choice could not be saved. Try again.', 'error'));
  }

  const actions: HubActions = {
    onSwitch: (bucket: LiveBucket) => {
      if (data && data.profile.track !== bucket) remember({ ...data.profile, track: bucket });
      setPlace(bucket);
    },
    onPlace: setPlace,
    onToday: () => run({ build: (d) => buildSession('today', d), empty: 'Nothing to do right now. Come back tomorrow for reviews.' }),
    onLevel: (bucket, level) => {
      const size = data?.profile.batchSize ?? level.words.length;
      run({
        build: (d) => {
          const fresh = levelsOf(d, bucket, size).find((l) => l.number === level.number);
          return fresh ? levelSession(d, fresh) : [];
        },
        empty: 'This level has no words yet.',
      });
    },
    onReview: (bucket, level) => {
      const size = data?.profile.batchSize ?? level.words.length;
      run({ build: (d) => {
        const selected = levelsOf(d, bucket, size).find(candidate => candidate.number === level.number);
        return selected ? revisitLevel(d, selected) : [];
      }, empty: 'No learned words in this level yet.', next: {
        build: (d) => {
          const next = levelsOf(d, bucket, size).find(candidate => candidate.number >= level.number && candidate.words.some(word => !d.progress[word.id]));
          return next ? levelSession(d, next) : [];
        },
        empty: 'You have learned every word in this track.',
      } });
    },
    onQuiz: (bucket) => {
      run({ build: (d) => buildSession('practice', d, bucket), empty: 'Learn a few words first, then try a quiz.' });
    },
    onBatchSize: (size) => {
      if (data && data.profile.batchSize !== size) remember({ ...data.profile, batchSize: size });
    },
    onListenComplete: () => {
      if (!data) return;
      const day = dayKey();
      const delta = { learned: 0, reviews: 1, correct: 0, xp: 0 };
      setData((d) => (d ? { ...d, activity: applyDelta(d.activity, day, delta) } : d));
      recordActivity(data, delta, day).catch((err: unknown) => {
        setNotice(`Progress could not be saved: ${err instanceof Error ? err.message : 'network error'}.`, 'error');
      });
    },
    onGrammarAward: (xp, completionOnly) => {
      if (!data) return;
      const day = dayKey();
      const delta = { learned: 0, reviews: completionOnly ? 0 : 1, correct: completionOnly ? 0 : 1, xp };
      setData((d) => (d ? { ...d, activity: applyDelta(d.activity, day, delta) } : d));
      recordActivity(data, delta, day).catch((err: unknown) => {
        setNotice(`Progress could not be saved: ${err instanceof Error ? err.message : 'network error'}.`, 'error');
      });
    },
    onAddedWord: (word) => {
      setData((d) => {
        if (!d || d.words.some((w) => w.lemma === word.lemma)) return d;
        return { ...d, words: [word, ...d.words] };
      });
    },
  };

  function record(item: SessionItem, outcome: Outcome) {
    if (!data || item.kind === 'revisit') return;
    const now = Date.now();
    const day = dayKey(now);
    const prev = data.progress[item.wordId];
    const progress =
      outcome === 'learned'
        ? (prev ?? learnedNow(item.wordId, now))
        : reviewed(prev ?? learnedNow(item.wordId, now), outcome === 'correct', now);
    const delta =
      outcome === 'learned'
        ? { learned: prev ? 0 : 1, reviews: 0, correct: 0, xp: prev ? 0 : XP.learn }
        : { learned: 0, reviews: 1, correct: outcome === 'correct' ? 1 : 0, xp: outcome === 'correct' ? XP.correct : XP.wrong };

    setData((d) =>
      d
        ? {
            ...d,
            progress: { ...d.progress, [item.wordId]: progress },
            activity: applyDelta(d.activity, day, delta),
          }
        : d,
    );
    recordItem(data, progress, delta, day).catch((err: unknown) => {
      setNotice(`Progress could not be saved: ${err instanceof Error ? err.message : 'network error'}.`, 'error');
    });
  }

  async function updateProfile(profile: LearnerProfile) {
    if (!data) return;
    await saveProfile(data, profile);
    setData((d) => (d ? { ...d, profile } : d));
  }

  async function handleReset(scope: ResetScope) {
    if (!data) return;
    const summary = trackSummary(data, data.profile.track, data.profile.batchSize);
    const level = summary.current ?? (summary.complete ? summary.levels.at(-1) ?? null : null);
    const wordIds =
      scope === 'level'
        ? (level?.words.map((w) => w.id) ?? [])
        : data.words.filter((w) => w.bucket === data.profile.track).map((w) => w.id);
    const progress = await resetProgress(data, wordIds);
    const next = { ...data, progress };
    const activity = clampTodayLearned(data.activity, learnedToday(next));
    setData((d) => (d ? { ...d, progress, activity } : d));
    const today = data.activity.find((entry) => entry.day === dayKey());
    const drop = (today?.learned ?? 0) - learnedToday(next);
    if (drop > 0) {
      recordActivity(data, { learned: -drop, reviews: 0, correct: 0, xp: 0 }, dayKey()).catch(() => undefined);
    }
  }

  return (
    <div className="student" data-ta-font={data?.profile.taFont ?? 'noto-sans-ta'} data-hi-font={data?.profile.hiFont ?? 'noto-sans-hi'}>
      <div className="app">
        <a className="skip" href="#main">
          Skip to content
        </a>
        <TopBar
          name={data?.profile.name ?? 'Learner'}
          streak={totals.streak}
          xp={totals.xp}
          onHome={() => {
            navigate({ view: 'home', place: 'home' });
          }}
          onProfile={() => setView('profile')}
          staff={!!data?.staff}
          userId={data?.userId ?? 'guest'}
        />
        <main id="main">
          {notice && (
            <p className={`s-notice ${noticeTone}`} role={noticeTone === "error" ? "alert" : "status"}>
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">
                ×
              </button>
            </p>
          )}
          {!data ? (
            <div className="dash" aria-busy="true" aria-label="Loading your words">
              <div className="dash-main">
                <span className="card skeleton tall" />
                <span className="card skeleton" />
              </div>
              <div className="dash-side">
                <span className="card skeleton tall" />
              </div>
            </div>
          ) : view === 'session' ? (
            <Session
              key={sessionId}
              data={data}
              items={items}
              onRecord={record}
              onExit={() => setView('home')}
              onAgain={() => (last.current ? run(last.current.next ?? last.current) : setView('home'))}
            />
          ) : view === 'profile' ? (
            <ProfileView
              data={data}
              sample={data.mode === 'sample'}
              onSave={updateProfile}
              onReset={handleReset}
              onBack={() => setView('home')}
            />
          ) : (
            <Hub data={data} place={place} actions={actions} />
          )}
        </main>
      </div>
    </div>
  );
}
