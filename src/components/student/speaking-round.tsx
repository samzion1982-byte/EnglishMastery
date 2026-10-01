'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  beginnerLevels,
  followTranscript,
  paintFollow,
  saveSpeakAward,
  speakMedal,
  SPEAK_LEVELS,
  type SpeakVocab,
} from '@/lib/speaking-lines';
import { encodeWav, wavDurationMs } from '@/lib/speak-wav';
import { speakWord, stopDictate } from '@/lib/speech';

type Phase = 'help' | 'count' | 'read' | 'check' | 'score' | 'final';
type Score = { matched: number; total: number; words: { word: string; hit: boolean }[]; heard: string; local: boolean; pending?: boolean; unavailable?: boolean; incomplete?: boolean; passageWordsHeard?: number; passageWordsTotal?: number };
type Tape = { wav: (lastMs?: number) => Blob; stop: () => void };

type LiveRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
};
type RecognitionWindow = Window & {
  SpeechRecognition?: new () => LiveRecognition;
  webkitSpeechRecognition?: new () => LiveRecognition;
};

const COUNT = ['3', '2', '1', 'Go'];
const STORY_TITLES = ['A walk in the park', 'At the market', 'Caught in the rain', 'A classroom experiment', 'Ready for the school trip'];


function audioContext() {
  const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return Ctor ? new Ctor() : null;
}

function startTape(ctx: AudioContext, media: MediaStream, onVoice?: (peak: number) => void): Tape {
  const chunks: Float32Array[] = [];
  const source = ctx.createMediaStreamSource(media);
  const node = ctx.createScriptProcessor(4096, 1, 1);
  const mute = ctx.createGain();
  mute.gain.value = 0;
  node.onaudioprocess = (event) => {
    const input = event.inputBuffer.getChannelData(0);
    const data = new Float32Array(input);
    chunks.push(data);
    let peak = 0;
    for (let index = 0; index < data.length; index += 1) {
      const value = Math.abs(data[index]);
      if (value > peak) peak = value;
    }
    onVoice?.(peak);
  };
  source.connect(node);
  node.connect(mute);
  mute.connect(ctx.destination);
  return {
    wav: (lastMs?: number) => encodeWav(chunks, ctx.sampleRate, 16000, lastMs),
    stop() {
      node.onaudioprocess = null;
      try { source.disconnect(); node.disconnect(); mute.disconnect(); } catch { /* Already stopped. */ }
    },
  };
}

export function SpeakingRound({
  words,
  learnedIds,
  onClose,
}: {
  words: SpeakVocab[];
  learnedIds: ReadonlySet<string>;
  onClose: () => void;
}) {
  const learnedKey = [...learnedIds].sort().join('\0');
  const levels = useMemo(() => beginnerLevels(words, new Set(learnedKey ? learnedKey.split('\0') : [])), [words, learnedKey]);
  const [levelIndex, setLevelIndex] = useState(0);
  const [marks, setMarks] = useState<number[]>(() => Array(SPEAK_LEVELS).fill(0));
  const passage = levels[levelIndex];
  const [phase, setPhase] = useState<Phase>('help');
  const readingPhase = useRef(phase);
  const recognizing = phase === 'count' || phase === 'read';
  useEffect(() => { readingPhase.current = phase; }, [phase]);
  const [tick, setTick] = useState(0);
  const [heard, setHeard] = useState('');
  const [error, setError] = useState('');
  const [score, setScore] = useState<Score | null>(null);
  const [lit, setLit] = useState(0);
  const [heardIndices, setHeardIndices] = useState<Set<number>>(() => new Set());
  const [preview, setPreview] = useState(0);
  const lead = useRef({ recognized: 0, eligible: false, voicedBuffers: 0 });
  const heardRef = useRef('');
  const [followStatus, setFollowStatus] = useState('Listening for passage words…');
  const stream = useRef<MediaStream | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const tape = useRef<Tape | null>(null);
  const gone = useRef(false);
  const submitted = useRef(false);
  const acquiring = useRef(false);
  const [requestingMic, setRequestingMic] = useState(false);
  const labels = passage.keywords.map((keyword) => keyword.word);
  const labelsRef = useRef(labels);
  const passageRef = useRef(passage.text);
  labelsRef.current = labels;
  passageRef.current = passage.text;
  let wordIndex = -1;
  let predictedToken = -1;
  const painted = paintFollow(passage.text, 0).map((token, index) => {
    if (!token.word) return { ...token, progressed: false };
    wordIndex += 1;
    if (preview === lit + 1 && wordIndex === lit) predictedToken = index;
    return { ...token, hit: heardIndices.has(wordIndex), progressed: wordIndex < lit };
  });

  useEffect(() => {
    heardRef.current = heard;
  }, [heard]);

  useEffect(() => {
    // Strict Mode replays setup after cleanup on mount.
    gone.current = false;
    return () => {
      gone.current = true;
      stopDictate();
      tape.current?.stop();
      void ctx.current?.close();
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (phase !== 'count') return;
    setTick(0);
    let step = 0;
    const id = window.setInterval(() => {
      step += 1;
      if (step >= COUNT.length) {
        window.clearInterval(id);
        setPhase('read');
        return;
      }
      setTick(step);
    }, 800);
    return () => window.clearInterval(id);
  }, [phase]);

  async function sendHear(blob: Blob) {
    const body = new FormData();
    body.set('passage', passageRef.current);
    body.set('keywords', JSON.stringify(labelsRef.current));
    body.set('audio', new File([blob], 'passage.wav', { type: 'audio/wav' }));
    body.set('audioMs', String(wavDurationMs(blob)));
    const response = await fetch('/api/speaking/hear', { method: 'POST', body, signal: AbortSignal.timeout(25000) });
    const payload = await response.json().catch(() => null) as { error?: string; heard?: string; matched?: number; total?: number; keywords?: { word: string; hit: boolean }[]; silent?: boolean; incomplete?: boolean; passageWordsHeard?: number; passageWordsTotal?: number } | null;
    return { response, payload };
  }

  useEffect(() => {
    if (phase !== 'read') return;
    const media = stream.current;
    const context = ctx.current;
    if (!media || !context) {
      setError('The microphone is not ready. Press Not Now, then start the set again.');
      return;
    }
    tape.current?.stop();
    if (context.state === 'suspended') void context.resume();
    setHeard('');
    setLit(0);
    setHeardIndices(new Set());
    setPreview(0);
    lead.current = { recognized: 0, eligible: false, voicedBuffers: 0 };
    const recording = startTape(context, media, (peak) => {
      if (submitted.current || gone.current || readingPhase.current !== 'read') return;
      const cursor = lead.current;
      cursor.voicedBuffers = peak >= 0.006 ? cursor.voicedBuffers + 1 : 0;
      // Audio may reveal ONE upcoming word, but can never advance the recognized cursor.
      // Silence freezes the preview; only a new transcript permits another step.
      if (cursor.eligible && cursor.voicedBuffers >= 2) setPreview(cursor.recognized + 1);
    });
    tape.current = recording;
    const cap = window.setTimeout(() => stopReading(), 180000);
    return () => {
      window.clearTimeout(cap);
      recording.stop();
    };
  }, [phase]);

  useEffect(() => {
    if (!recognizing) return;
    // Connect during the countdown, retaining the same session when reading begins.
    const target = passageRef.current;
    const countdownResults = new Map<number, { text: string; final: boolean }>();
    let active = true;
    let retry = true;
    let sessionBase = 0;
    let confirmed = 0;
    let latestCursor = 0;
    let latestHits = new Set<number>();
    let sessionHits = new Set<number>();
    let confirmedHits = new Set<number>();
    const available = () => active && !submitted.current && !gone.current;
    const browser = window as RecognitionWindow;
    const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    let recognition: LiveRecognition | null = null;
    let restart: number | undefined;
    let watchdog: number | undefined;
    let lastTranscript = '';
    let unmatchedUpdates = 0;
    const watchResults = () => {
      window.clearTimeout(watchdog);
      watchdog = window.setTimeout(() => {
        if (available() && readingPhase.current === 'read') setFollowStatus('Waiting for new speech-recognition results. Keep reading; your audio is still recording.');
      }, 8000);
    };
    const unavailable = () => setFollowStatus('Live highlighting is unavailable. Your recording will still be scored when you finish.');
    setFollowStatus('Listening for passage words…');
    if (Recognition) {
      recognition = new Recognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        if (!available()) return;
        watchResults();
        if (readingPhase.current !== 'read') {
          Array.from(event.results).forEach((result, index) => countdownResults.set(index, { text: result[0].transcript, final: result.isFinal }));
          return;
        }
        const results = Array.from(event.results).map((result, index) => {
          const ignored = countdownResults.get(index);
          const text = result[0].transcript;
          // Exclude countdown speech, including a partial segment completed during reading.
          const transcript = ignored?.final ? '' : ignored && text.startsWith(ignored.text) ? text.slice(ignored.text.length) : text;
          return { 0: { transcript }, isFinal: result.isFinal };
        });
        const transcript = results.map((result) => result[0].transcript).join(' ');
        const finalText = results.filter((result) => result.isFinal).map((result) => result[0].transcript).join(' ');
        confirmedHits = new Set(sessionHits);
        confirmed = followTranscript(target, finalText, sessionBase, labelsRef.current, confirmedHits);
        // Render the latest hypothesis immediately, from a fixed session base.
        // Revisions may retract guesses; finalized words cannot be retracted.
        // Never gate a delayed recognition event on the microphone's current volume.
        const currentHits = new Set(sessionHits);
        const next = Math.max(confirmed, followTranscript(target, transcript, sessionBase, labelsRef.current, currentHits));
        latestCursor = next;
        latestHits = new Set([...confirmedHits, ...currentHits]);
        setHeardIndices(new Set(latestHits));
        const cursor = lead.current;
        const previous = cursor.recognized;
        cursor.eligible = next >= 2 && next >= previous && results.some((result) => !result.isFinal);
        cursor.recognized = next;
        setLit(next);
        if (next !== previous || !cursor.eligible) {
          setPreview(cursor.eligible && cursor.voicedBuffers >= 2 ? next + 1 : 0);
        }
        if (transcript !== lastTranscript) unmatchedUpdates = next > previous ? 0 : unmatchedUpdates + 1;
        lastTranscript = transcript;
        setFollowStatus(unmatchedUpdates >= 2
          ? 'Speech is arriving, but matching is uncertain. Keep reading the next sentence; scoring runs when you finish.'
          : 'Bright yellow marks recognized words; soft yellow tracks progress or previews the next word.');
      };
      recognition.onerror = (event) => {
        if (!available() || event.error === 'aborted') return;
        if (event.error === 'no-speech') {
          setFollowStatus('Listening for passage words…');
          return;
        }
        retry = false;
        window.clearTimeout(watchdog);
        lead.current.eligible = false;
        setPreview(0);
        unavailable();
      };
      const start = () => {
        if (!available() || !retry) return;
        countdownResults.clear();
        lastTranscript = '';
        unmatchedUpdates = 0;
        // Retain the last observed hypothesis across a service restart, never the prediction.
        sessionBase = latestCursor;
        confirmed = latestCursor;
        confirmedHits = new Set(latestHits);
        sessionHits = new Set(latestHits);
        setHeardIndices(new Set(confirmedHits));
        setLit(confirmed);
        setPreview(0);
        lead.current = { recognized: confirmed, eligible: false, voicedBuffers: 0 };
        watchResults();
        try { recognition?.start(); } catch { retry = false; unavailable(); }
      };
      recognition.onend = () => {
        if (available() && retry) restart = window.setTimeout(start, 160);
      };
      start();

    } else {
      unavailable();
    }
    return () => {
      active = false;
      lead.current.eligible = false;
      window.clearTimeout(watchdog);
      window.clearTimeout(restart);
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      }
    };
  }, [recognizing]);

  async function okay() {
    if (acquiring.current || gone.current) return;
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser cannot use the microphone. Try Chrome or Edge.');
      return;
    }
    const context = audioContext();
    if (!context) {
      setError('This browser cannot use the microphone. Try Chrome or Edge.');
      return;
    }
    acquiring.current = true;
    setRequestingMic(true);
    try {
      await context.resume();
      if (gone.current) { void context.close(); return; }
      const media = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
      if (gone.current) {
        media.getTracks().forEach((track) => track.stop());
        void context.close();
        return;
      }
      stream.current = media;
      ctx.current = context;
      setHeard('');
      setLit(0);
      setPhase('count');
    } catch {
      void context.close();
      if (!gone.current) setError('Allow the microphone, then press Okay.');
    } finally {
      acquiring.current = false;
      if (!gone.current) setRequestingMic(false);
    }
  }

  function stopReading() {
    if (submitted.current) return;
    submitted.current = true;
    const blob = tape.current?.wav() ?? new Blob();
    tape.current?.stop();
    setScore({
      matched: 0,
      total: labels.length,
      words: labels.map((word) => ({ word, hit: false })),
      heard: '',
      local: false,
      pending: true,
    });
    setError('');
    setPhase('score');
    void submit(blob);
  }

  async function submit(blob: Blob) {
    const remember = (matched: number) => {
      setMarks((list) => list.map((mark, index) => index === levelIndex ? Math.max(mark, matched) : mark));
    };
    const unable = (message: string) => {
      if (gone.current) return;
      setScore({ matched: 0, total: labels.length, words: [], heard: '', local: false, unavailable: true });
      setError(message);
    };
    if (blob.size < 800) {
      unable('We did not capture enough audio. Please read again.');
      return;
    }
    try {
      const { response, payload } = await sendHear(blob);
      if (gone.current) return;
      if (!response.ok || !payload || !Array.isArray(payload.keywords) || typeof payload.matched !== 'number') {
        unable(payload?.error || 'Speaking check is unavailable. Please try again.');
        return;
      }
      if (payload.silent) {
        unable('No clear speech was detected. Please read again closer to the microphone.');
        return;
      }
      const next = { incomplete: payload.incomplete, passageWordsHeard: payload.passageWordsHeard, passageWordsTotal: payload.passageWordsTotal, matched: payload.matched, total: payload.total ?? labels.length, words: payload.keywords, heard: payload.silent ? '' : (payload.heard ?? ''), local: false };
      if (!next.incomplete) remember(next.matched);
      setScore(next);
      setHeard(next.heard);
      setError(payload.silent ? 'We did not catch the reading. Read it once more, a little closer to the microphone.' : '');
    } catch {
      unable('Speaking check is unavailable. Try this passage again.');
    }
  }

  function dismiss() {
    if (score?.pending && phase === 'score') return;
    stopDictate();
    onClose();
  }

  function again() {
    stopDictate();
    submitted.current = false;
    setScore(null);
    setHeard('');
    setError('');
    setLit(0);
    setPhase('count');
  }

  function nextLevel() {
    stopDictate();
    if (levelIndex >= levels.length - 1) {
      const total = marks.reduce((sum, mark) => sum + mark, 0);
      const max = levels.reduce((sum, level) => sum + level.keywords.length, 0);
      saveSpeakAward('beginner', total, max);
      setPhase('final');
      return;
    }
    submitted.current = false;
    setLevelIndex((index) => index + 1);
    setScore(null);
    setHeard('');
    setError('');
    setLit(0);
    setPhase('count');
  }

  function hearMissedWord(word: string) {
    setError('');
    const failed = () => {
      if (!gone.current) setError('Pronunciation audio is unavailable. Check your browser sound or try another English voice.');
    };
    if (!speakWord(word, 'en', failed)) failed();
  }

  const medal = speakMedal(marks.reduce((sum, mark) => sum + mark, 0), levels.reduce((sum, level) => sum + level.keywords.length, 0));
  const tone = medal?.medal === 'Gold' ? 'gold' : medal?.medal === 'Silver' ? 'silver' : medal?.medal === 'Bronze' ? 'bronze' : 'plain';

  return createPortal(
    <div className="listen-score-backdrop">
      <div className={`listen-score-modal speak-lesson${phase === 'help' ? ' is-help' : ''}${phase === 'read' || phase === 'check' || phase === 'score' || phase === 'final' ? ' is-passage' : ''}`} data-phase={phase} role="dialog" aria-modal="true" aria-labelledby="speak-lesson-title">
        <button type="button" className="speak-close" onClick={dismiss} disabled={phase === 'score' && !!score?.pending} aria-label="Close">
          ×
        </button>
        {phase !== 'help' && (
          <ol className="speak-steps" aria-label="Passage progress">
            {levels.map((level, index) => (
              <li key={level.level} className={phase === 'final' || index < levelIndex ? 'is-complete' : index === levelIndex ? 'is-current' : ''} aria-current={phase !== 'final' && index === levelIndex ? 'step' : undefined}>
                <span aria-hidden="true">{phase === 'final' || index < levelIndex ? '✓' : index + 1}</span>
                <span className="speak-step-name">Passage {index + 1}</span>
              </li>
            ))}
          </ol>
        )}
        {phase === 'help' && (
          <>
            <h2 id="speak-lesson-title">Before you begin</h2>
            <ol className="speak-instructions">
              <li>A short passage will appear after the countdown.</li>
              <li>Read clearly, at a comfortable pace.</li>
              <li>Highlights follow your reading; soft yellow shows estimated progress.</li>
              <li>Your score counts hidden keywords heard, not pronunciation quality.</li>
            </ol>
            {error && <p className="speak-error" role="alert">{error}</p>}
            <div className="speak-choice">
              <button type="button" className="s-btn speak-no" onClick={onClose}>Not Now</button>
              <button type="button" className="s-btn speak-yes" disabled={requestingMic} onClick={() => void okay()}>Okay</button>
            </div>
          </>
        )}

        {phase === 'count' && (
          <>
            <p className="listen-score-kicker">Take a breath · Get ready</p>
            <div className="speak-count" id="speak-lesson-title" aria-live="assertive" aria-atomic="true">
              <div key={tick} className={'listen-cue speak-count-cue' + (COUNT[tick] === 'Go' ? ' is-go' : '')}>
                <strong>{COUNT[tick]}</strong>
              </div>
            </div>
          </>
        )}

        {phase === 'read' && (
          <>
            <p className="listen-score-kicker">Passage {passage.level} of {levels.length} <span className="speak-topic">{STORY_TITLES[levelIndex]}</span></p>
            <h2 id="speak-lesson-title" className="speak-read-title">Read the passage</h2>
            <p className="speak-passage">
              {painted.map((token, index) => (
                <span key={index} className={token.hit ? 'is-hit' : token.progressed ? 'is-followed' : index === predictedToken ? 'is-preview' : undefined}>{token.text}</span>
              ))}
            </p>
            <p className="listen-note speak-live-note speak-sr-only" role="status">{followStatus}</p>
            {error && <p className="speak-error" role="alert">{error}</p>}
            <div className="speak-reading-actions">
              <div className="speak-reading-meta">
                <span className="speak-time-limit"><span aria-hidden="true">◷</span> Up to 3 minutes</span>
                <span className="speak-reading-status" title={followStatus}>
                  {followStatus.includes('unavailable') ? 'Live highlighting unavailable' : followStatus.includes('uncertain') ? 'Matching your words…' : followStatus.includes('Waiting for') ? 'Waiting for recognition…' : ''}
                </span>
              </div>
              <button type="button" className="s-btn primary" onClick={stopReading}>I'm done</button>
            </div>
          </>
        )}

        {phase === 'score' && score && (
          <>
            <p className="listen-score-kicker">Level {passage.level}/{levels.length}</p>
            <h2 className={score.pending ? 'speak-score-heading is-checking' : 'speak-score-heading'} id="speak-lesson-title">{score.pending ? 'Checking' : score.unavailable ? 'Unable to assess' : `${score.matched} of ${score.total}`}</h2>
            {(score.pending || score.unavailable || marks[levelIndex] > score.matched) && (
              <p className="listen-fraction">
                {score.pending
                  ? 'Listening back to your reading…'
                  : score.unavailable ? 'No score was recorded. Please retry this passage.'
                  : `Best kept: ${marks[levelIndex]} of ${score.total} keywords.`}
              </p>
            )}
            {!score.unavailable && <p className="listen-note">Keywords heard</p>}
            {score.incomplete && <p className="speak-error" role="status">Please read the whole passage again. Only {score.passageWordsHeard} of {score.passageWordsTotal} passage words were recognized; this attempt does not count towards your award.</p>}
            {!score.pending && !score.unavailable && !score.incomplete && score.words.some((word) => !word.hit) && <p className="speak-practice-tip">Tap a speaker to practise a missed word, then read again.</p>}
            <ul className="listen-review" aria-busy={!!score.pending}>
              {score.words.map((word) => (
                <li key={word.word} className={score.pending ? '' : word.hit ? 'right' : 'wrong'}>
                  <strong>{word.word}</strong>
                  <div className="speak-word-result">
                    <span>{score.pending ? 'Checking' : word.hit ? 'Heard' : 'Missed'}
                      {!score.pending && <b className="speak-result-mark" aria-hidden="true">{word.hit ? '✓' : '✕'}</b>}
                    </span>
                    {!score.pending && !word.hit && (
                      <button type="button" className="s-btn speak-pronounce" onClick={() => hearMissedWord(word.word)} aria-label={'Hear pronunciation of ' + word.word} title={'Hear ' + word.word}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                          <path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
                        </svg>
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {error && <p className="speak-error" role="alert">{error}</p>}
            {!score.pending && (
              <div className="listen-actions">
                <button type="button" className="s-btn ghost" onClick={again}>Read again</button>
                <button type="button" className="s-btn primary" onClick={nextLevel} disabled={score.unavailable || score.incomplete}>
                  {levelIndex + 1 < levels.length ? `Next passage · ${levelIndex + 2} of ${levels.length}` : 'Final score'}
                </button>
              </div>
            )}
          </>
        )}

        {phase === 'final' && (
          <>
            <p className="listen-score-kicker">All five passages complete</p>
            <div className={`listen-medal ${tone}`}>{medal.medal}</div>
            <h2 id="speak-lesson-title">{medal.total} of {medal.max}</h2>
            <p className="listen-fraction">{medal.line}</p>
            <ul className="listen-set">
              {levels.map((level, index) => (
                <li key={level.level}>
                  <span>{index + 1}/{levels.length}</span>
                  <strong>Level {level.level}</strong>
                  <em>{marks[index]}/{level.keywords.length}</em>
                </li>
              ))}
            </ul>
            <button type="button" className="s-btn primary" onClick={onClose}>Done</button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
