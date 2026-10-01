'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../icon';
import { PracticeCorrectionDialog, type CorrectionReview } from './practice-correction-dialog';


import { GoalRing } from './goal-ring';
import type { LearnerData, StudyWord } from '@/lib/learner';
import {
  PRACTICE_TOTAL,
  praiseLine,
  drawPracticePool,
  emptyMix,
  mixTotal,
  textUsesWord,
  trackSource,
  type PracticeMark,
  type PracticeMix,
} from '@/lib/practice';
import { bucketLabel, liveBuckets, type LiveBucket } from '@/lib/vocab';

type Mode = 'sentences' | 'story';

const PILL_COLORS = ['#0b5c56', '#5a2d96', '#8d2d4e', '#1d4e89', '#8a4b12', '#0f6a45', '#6a3d78', '#3d4f8a'];

function writingUses(word: StudyWord, mode: Mode, story: string, sentences: Record<string, string>) {
  const text = mode === 'story' ? story : sentences[word.id] ?? '';
  return textUsesWord(text, word.word) || textUsesWord(text, word.lemma);
}

export function PracticeCorner({ data, onExit }: { data: LearnerData; onExit: () => void }) {
  const [mix, setMix] = useState<PracticeMix>(emptyMix);
  const [pool, setPool] = useState<StudyWord[] | null>(null);
  const [mode, setMode] = useState<Mode>('sentences');
  const [step, setStep] = useState(0);
  const [story, setStory] = useState('');
  const [sentences, setSentences] = useState<Record<string, string>>({});
  const [praise, setPraise] = useState('');
  const [mark, setMark] = useState<PracticeMark | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reviews,setReviews]=useState<CorrectionReview[]>([]);
  const [flash,setFlash]=useState(false);
  const [cheer,setCheer]=useState('Good');
  const [skipped,setSkipped]=useState<string[]>([]);
  const [retryAt,setRetryAt]=useState(0);
  const [retrySeconds,setRetrySeconds]=useState(0);
  useEffect(()=>{const update=()=>setRetrySeconds(Math.max(0,Math.ceil((retryAt-Date.now())/1000)));update();const timer=setInterval(update,1000);return()=>clearInterval(timer);},[retryAt]);
  const [hint, setHint] = useState('');
  const [cleared, setCleared] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [blankCount, setBlankCount] = useState<LiveBucket | null>(null);
  const found = useRef(new Set<string>());
  const acceptedText = useRef<Record<string, string>>({});
  const requestId = useRef(0);
  const nextPending = useRef(false);
  useEffect(() => () => { requestId.current += 1; }, []);
  const total = mixTotal(mix);
  const sources = useMemo(() => Object.fromEntries(liveBuckets.map((bucket) => [bucket, trackSource(data, bucket)])), [data]);

  const colors = useMemo(() => {
    const map: Record<string, string> = {};
    pool?.forEach((word, index) => {
      map[word.id] = PILL_COLORS[(index * 3 + word.word.length) % PILL_COLORS.length];
    });
    return map;
  }, [pool]);

  const used = useMemo(() => {
    if (!pool) return new Set<string>();
    if (mode === 'sentences') return new Set(cleared);
    return new Set(pool.filter((word) => writingUses(word, mode, story, sentences)).map((word) => word.id));
  }, [pool, mode, story, sentences, cleared]);

  function forget(id: string) {
    found.current.delete(id);
    delete acceptedText.current[id];
    setCleared((current) => (current.includes(id) ? current.filter((item) => item !== id) : current));
  }

  function cancelCheck() {
    requestId.current += 1;
    setFlash(false);
    setReviews([]);
    setHint('');
    setError('');
    setChecking(false);
    setPraise('');
  }

  async function acceptSentence(word: StudyWord, text: string) {
    const clean = text.trim();
    if(!clean){setHint('Write a sentence using your target word.');return false;}
    if (found.current.has(word.id) && acceptedText.current[word.id] === clean) return true;
    const ticket = ++requestId.current;
    setChecking(true);
    setFlash(false);
    setHint('Checking the sentence…');
    setPraise('');
    try {
      const res = await fetch('/api/practice/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, word: word.word, language: 'en-GB' }),
        signal: AbortSignal.timeout(40000),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; error?: string; matches?: CorrectionReview['matches'] };
      if (ticket !== requestId.current || !pool) return false;
      if(!res.ok){
        if(res.status===429)setRetryAt(Date.now()+(Number(res.headers.get('retry-after'))||60)*1000);
        setHint(body.message||body.error||'The suggestion did not finish. Try again or skip.');return false;
      }
      if(typeof body.ok!=='boolean'||!Array.isArray(body.matches)){setHint('The suggestion was incomplete. Please retry.');return false;}
      if(!body.ok){forget(word.id);setHint('');setReviews([{word:word.word,original:clean,message:body.message,matches:body.matches}]);return false;}
      found.current.add(word.id);
      acceptedText.current[word.id] = clean;
      setCleared((current) => (current.includes(word.id) ? current : [...current, word.id]));
      setHint('');
      setSkipped(current=>current.filter(id=>id!==word.id));
      return true;
    } catch {
      if (ticket !== requestId.current) return false;
      forget(word.id);
      setHint('The grammar check did not answer. Click Submit to try again.');
      return false;
    } finally {
      if (ticket === requestId.current) setChecking(false);
    }
  }

  function editWriting(){if(mode==='sentences'&&pool){const index=pool.findIndex(word=>word.word===reviews[0]?.word);if(index>=0)setStep(index);}setReviews([]);requestAnimationFrame(()=>document.querySelector<HTMLTextAreaElement>(mode==='story'?'.practice-story':'.practice-one textarea')?.focus());}
  function skipWord(){
    if(!pool)return;
    const id=pool[step].id;cancelCheck();forget(id);
    setSkipped(current=>current.includes(id)?current:[...current,id]);
    const next=pool.findIndex((word,index)=>index>step&&!skipped.includes(word.id)&&!used.has(word.id));
    const earlier=pool.findIndex((word,index)=>index<step&&!skipped.includes(word.id)&&!used.has(word.id));
    if(next>=0)setStep(next);else if(earlier>=0)setStep(earlier);else setHint('Return to a skipped word when you are ready.');
  }
  async function goNext() {
    if(!pool||checking||busy||nextPending.current||Date.now()<retryAt)return;
    nextPending.current=true;
    const currentStep=step;
    try{
      const word=pool[currentStep];
      const ok=await acceptSentence(word,sentences[word.id]??'');
      if(!ok)return;
      const ticket=requestId.current;
      setCheer(praiseLine(word.bucket, found.current.size, pool.length));
      setFlash(true);
      await new Promise(resolve=>setTimeout(resolve,1600));
      if(ticket!==requestId.current)return;
      setFlash(false);
      if(currentStep<pool.length-1)setStep(currentStep+1);
      else setHint('Sentence checked.');
    }finally{nextPending.current=false;}
  }

  function setCount(bucket: LiveBucket, next: number) {
    const cap = sources[bucket].available;
    const others = total - mix[bucket];
    const room = PRACTICE_TOTAL - others;
    setMix({ ...mix, [bucket]: Math.max(0, Math.min(next, cap, room)) });
  }

  function begin() {
    if (total !== PRACTICE_TOTAL) return;
    const next = drawPracticePool(data, mix);
    found.current = new Set();
    acceptedText.current = {};
    requestId.current += 1;
    setChecking(false);
    setCleared([]);
    setSkipped([]);
    setReviews([]);
    setFlash(false);
    setHint('');
    setStep(0);
    setPool(next);
    setSentences({});
    setStory('');
    setMark(null);
    setPraise('');
    setError('');
  }

  async function submit() {
    if (!pool || busy || checking || nextPending.current || Date.now()<retryAt) return;
    setBusy(true);
    setError('');
    setReviews([]);
    const payload = {
      mode, language: 'en-GB', skipped:pool.filter(word=>skipped.includes(word.id)).map(word=>word.word),
      words: pool.map((word) => ({ word: word.word, meaning: word.meaning })),
      story,
      sentences: pool.map((word) => ({ word: word.word, text: sentences[word.id] ?? '' })),
    };
    try {
      const res = await fetch('/api/practice/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(40000),
      });
      const body = (await res.json().catch(() => ({}))) as PracticeMark & { error?: string; reviews?: CorrectionReview[] };
      if(res.status===429)setRetryAt(Date.now()+(Number(res.headers.get('retry-after'))||60)*1000);
      if(res.status===422&&body.reviews){setReviews(body.reviews);return;}
      if (!res.ok) throw new Error(body.error || 'The grammar service did not answer.');
      setHint('No change suggested.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The grammar service did not answer.');
    } finally {
      setBusy(false);
    }
  }

  if (!pool) {
    return (
      <section className="practice-setup">
        <div className="section-head">
          <h1>Practice Corner</h1>
          <p>Build a 10-word mix, then write with those words.</p>
        </div>
        <div className="card practice-mix">
          <p className="practice-total">
            <strong>{total}</strong>
            <span>/ {PRACTICE_TOTAL} words</span>
          </p>
          <ul className="practice-tracks">
            {liveBuckets.map((bucket) => {
              const source = sources[bucket];
              return (
                <li key={bucket}>
                  <div>
                    <strong>{bucketLabel[bucket]}</strong>
                    <p>{source.fromFinished ? `${source.finishedLevels} finished ${source.finishedLevels === 1 ? 'level' : 'levels'}` : 'Random from this track'}</p>
                  </div>
                  <div className="practice-step">
                    <button type="button" onClick={() => setCount(bucket, mix[bucket] - 1)} disabled={mix[bucket] === 0} aria-label={`Fewer ${bucketLabel[bucket]} words`}>
                      −
                    </button>
                    <input
                      inputMode="numeric"
                      aria-label={`${bucketLabel[bucket]} words`}
                      value={blankCount === bucket && mix[bucket] === 0 ? '' : mix[bucket]}
                      spellCheck={false}
                      autoCorrect="off"
                      onFocus={() => {
                        if (mix[bucket] === 0) setBlankCount(bucket);
                      }}
                      onBlur={() => setBlankCount(null)}
                      onChange={(event) => {
                        const raw = event.target.value.replace(/\D/g, '');
                        setCount(bucket, raw === '' ? 0 : Number(raw));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setCount(bucket, mix[bucket] + 1)}
                      disabled={mix[bucket] >= source.available || total >= PRACTICE_TOTAL}
                      aria-label={`More ${bucketLabel[bucket]} words`}
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <button type="button" className="s-btn primary start-level lg block" onClick={begin} disabled={total !== PRACTICE_TOTAL}>
            <Icon kind="play" />
            Start practice
          </button>
          <button type="button" className="s-btn ghost block" onClick={onExit}>
            Back home
          </button>
        </div>
      </section>
    );
  }

  if (mark) {
    return (
      <section className="practice-result">
        <div className="card practice-score">
          <GoalRing value={mark.score} goal={mark.max} size={120} label="checked" />
          <div>
            <p className="eyebrow accent">Check summary</p>
            <h1>{mark.score} / {mark.max}</h1>
            <p>{mark.summary}</p>
          </div>
        </div>
        <ul className="practice-notes">
          {[...mark.notes,...(mark.passageNotes??[])].map((note) => (
            <li key={note.word} className={note.ok ? 'ok' : 'fix'}>
              <strong>{note.word}</strong>
              <p>{note.teach}</p>

            </li>
          ))}
        </ul>
        <div className="practice-actions">
          <button type="button" className="s-btn primary" onClick={() => { setMark(null); setError(''); }}>Revise my writing</button>
          <button type="button" className="s-btn ghost" onClick={() => { setPool(null); setMark(null); }}>
            New mix
          </button>
          <button type="button" className="s-btn primary" onClick={onExit}>
            Back home
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="practice-play">
      <div className="practice-board">
        <div className="section-head">
          <h1>Write with your pool</h1>
          <p>{used.size} of {pool.length} words used</p>
        </div>
        <div className="practice-modes" role="group" aria-label="Writing style">
          <button type="button" className={mode === 'sentences' ? 'on' : ''} aria-pressed={mode === 'sentences'} disabled={busy || flash} onClick={() => { cancelCheck(); setHint(''); setMode('sentences'); }}>
            10 sentences
          </button>
          <button type="button" className={mode === 'story' ? 'on' : ''} aria-pressed={mode === 'story'} disabled={busy || flash} onClick={() => { cancelCheck(); setHint(''); setMode('story'); }}>
            One story
          </button>
        </div>
        {flash&&<div className="practice-success-flash" role="status"><div className="practice-success-card"><span className="practice-success-tick" aria-hidden="true"><Icon kind="check" /></span><span className="practice-success-smile" aria-hidden="true">😊</span><strong>{cheer}</strong></div></div>}
        {reviews.length>0&&<PracticeCorrectionDialog reviews={reviews} onEdit={editWriting} onSkip={mode==='sentences'&&reviews.length===1&&reviews[0].word===pool[step].word?skipWord:undefined} />}
        {praise && <p className="practice-praise" role="status">{praise}</p>}
        {mode === 'sentences' ? (
          <div className="practice-one">
            <label htmlFor={`line-${pool[step].id}`}>
              <span>{step + 1} / {pool.length}</span>
              {pool[step].word}
            </label>
            <textarea
              id={`line-${pool[step].id}`}
              key={pool[step].id}
              rows={3}
              maxLength={500}
              disabled={busy || flash}
              value={sentences[pool[step].id] ?? ''}
              placeholder={`Write a sentence with “${pool[step].word.toLowerCase()}”.`}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              onChange={(event) => {
                const id = pool[step].id;
                const value = event.target.value;
                setSentences({ ...sentences, [id]: value });
                setSkipped(current=>current.filter(item=>item!==id));
                if (acceptedText.current[id] && acceptedText.current[id] !== value.trim()) forget(id);
                cancelCheck();
              }}
            />

            {hint && !praise && <p className="practice-hint" role="status">{hint}</p>}
            <div className="practice-actions">
              <button
                type="button"
                className="s-btn ghost"
                onClick={() => {
                  cancelCheck();
                  setHint('');
                  setStep((n) => n - 1);
                }}
                disabled={step === 0 || checking || busy || flash}
              >
                <Icon kind="back" />
                Back
              </button>
              <span className="practice-actions-right">
              <button
                type="button"
                className="s-btn ghost"
                onClick={skipWord}
                disabled={checking || busy || flash}
              >
                Skip
              </button>
              <button
                type="button"
                className="s-btn practice-submit"
                onClick={() => void goNext()}
                disabled={busy || checking || flash || retrySeconds>0 || used.has(pool[step].id)}
              >
                {checking ? 'Checking…' : retrySeconds>0 ? 'Retry in '+retrySeconds+'s' : 'Submit'}
              </button>
              </span>
            </div>
          </div>
        ) : (
          <>
          <textarea
            className="practice-story"
            aria-label="Your practice story"
            maxLength={4000}
            disabled={busy || flash}
            rows={8}
            value={story}
            placeholder="Write one passage that uses every word in the pool."
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            onChange={(event) => { setStory(event.target.value); setReviews([]); setError(''); }}
          />
          <div className="practice-actions">
            <button type="button" className="s-btn practice-submit" onClick={() => void submit()} disabled={busy || checking || flash || retrySeconds>0 || !story.trim()}>
              {busy ? 'Checking…' : retrySeconds>0 ? 'Retry in '+retrySeconds+'s' : 'Submit'}
            </button>
          </div>
          {hint && <p className="practice-hint" role="status">{hint}</p>}
          </>
        )}
        {error && <p className="practice-error" role="alert">{error}</p>}
      </div>
      <aside className="card practice-pool" aria-label="Word pool">
        <div className="practice-pool-head">
          <p className="eyebrow">Word pool</p>
          <p className="practice-pool-count">{used.size}/{pool.length}</p>
        </div>
        <ul>
          {pool.map((word, index) => (
            <li key={word.id} className={used.has(word.id) ? 'used' : ''} style={used.has(word.id) ? undefined : { background: colors[word.id], color: '#fff' }}>
              {mode === 'sentences' ? <button type="button" className="practice-word-jump" aria-label={`Go to ${word.word}${used.has(word.id) ? ' (checked)' : ''}`} aria-current={step === index ? 'step' : undefined} disabled={busy || flash} onClick={() => { cancelCheck(); setHint(''); setStep(index); }}>{word.word}</button> : word.word}
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
