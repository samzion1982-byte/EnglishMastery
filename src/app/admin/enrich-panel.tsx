'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Progress = { total: number; ready: number; pending: number; failed: number; translator: boolean };
type BatchDebug = {
  words: number;
  saved: number;
  failed: number;
  selectMs: number;
  lookupMs: number;
  saveMs: number;
  countMs: number;
  totalMs: number;
  httpMedianMs: number;
  slowest: { lemma: string; totalMs: number; queueMs: number; cooldownMs: number; httpMs: number; status: number | 'error' } | null;
};
type Reply = Progress & { processed?: string[]; error?: string; pause?: boolean; retryIn?: number; debug?: BatchDebug };

const PAUSE_KEY = 'em-enrich-paused';
/** Short pause between batches. Wiktionary itself is paced on the server. */
const GAP_MS = 200;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function call(init?: RequestInit): Promise<Reply> {
  const res = await fetch('/api/enrich', { cache: 'no-store', ...init });
  const body = (await res.json().catch(() => ({}))) as Partial<Reply>;
  if (!res.ok) throw new Error(body.error || `Server returned ${res.status}`);
  return body as Reply;
}

function minutes(ms: number) {
  const m = Math.ceil(ms / 60_000);
  return m < 60 ? `about ${m} min left` : `about ${Math.floor(m / 60)} h ${m % 60} min left`;
}

/**
 * Looks up meanings, sentences, related words and dictionary details for every word once and saves them in Supabase,
 * a few words at a time while this page is open. Picks up where it stopped when the page is opened again.
 */
export function EnrichPanel({ refreshKey }: { refreshKey: number }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [paused, setPaused] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [eta, setEta] = useState('');
  const [debug, setDebug] = useState<BatchDebug | null>(null);
  const pausedRef = useRef(false);
  const runningRef = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const stored = localStorage.getItem(PAUSE_KEY) === '1';
    pausedRef.current = stored;
    setPaused(stored);
    return () => {
      alive.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    const started = Date.now();
    let done = 0;
    try {
      while (alive.current && !pausedRef.current) {
        const reply = await call({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        if (!alive.current) break;
        setProgress(reply);
        if (reply.debug) setDebug(reply.debug);
        done += reply.processed?.length ?? 0;
        if (done > 0 && reply.pending > 0) setEta(minutes(((Date.now() - started) / done) * reply.pending));
        if (reply.error) {
          setMessage(reply.error);
          if (reply.pause) {
            pausedRef.current = true;
            setPaused(true);
            break;
          }
        }
        if (reply.retryIn && !(reply.processed?.length)) {
          await sleep(reply.retryIn * 1000);
          continue;
        }
        if (reply.error && !(reply.processed?.length)) continue;
        setMessage('');
        if (reply.pending === 0) break;
        await sleep(GAP_MS);
      }
    } catch (err) {
      if (alive.current) setMessage(err instanceof Error ? err.message : 'Could not reach the server.');
    } finally {
      runningRef.current = false;
      if (alive.current) {
        setRunning(false);
        setEta('');
      }
    }
  }, []);

  useEffect(() => {
    let live = true;
    void call()
      .then((p) => {
        if (!live) return;
        setProgress(p);
        if (p.pending > 0 && !pausedRef.current) void run();
      })
      .catch((err: unknown) => live && setMessage(err instanceof Error ? err.message : 'Could not reach the server.'));
    return () => {
      live = false;
    };
  }, [refreshKey, run]);

  function toggle() {
    const next = !paused;
    pausedRef.current = next;
    setPaused(next);
    localStorage.setItem(PAUSE_KEY, next ? '1' : '0');
    if (!next) {
      setMessage('');
      void run();
    }
  }

  async function retryFailed() {
    try {
      setProgress(await call({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"retry":true}' }));
      if (!pausedRef.current) void run();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not reach the server.');
    }
  }

  if (!progress && !message) return null;
  const total = progress?.total ?? 0;
  const ready = progress?.ready ?? 0;
  const pct = total ? Math.floor((ready / total) * 100) : 0;
  const status = !progress
    ? ''
    : progress.pending === 0 && progress.failed === 0
      ? 'All words are ready. New words are looked up automatically after you add them.'
      : paused
        ? `Paused · ${progress.pending} words waiting`
        : running
          ? `Looking up meanings, sentences${progress.translator ? '' : ''}… ${eta}`
          : `${progress.pending} words waiting`;

  return (
    <section className="admin-card enrich-card" aria-live="polite">
      <div className="card-head">
        <h2>Word readiness</h2>
        <span className="meta">
          {ready.toLocaleString()} of {total.toLocaleString()} ready · {pct}%
        </span>
      </div>
      {progress && <p className="readiness-counts"><strong>{progress.pending + progress.failed}</strong> words need details · {progress.failed} need another attempt</p>}
      <div className="enrich-bar" aria-label="Words ready for learning" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={ready}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="enrich-foot">
        <span className={`meta${running ? ' enrich-running' : ''}`}>{status}</span>
        <span className="spacer" />
        {progress && progress.failed > 0 && (
          <button type="button" className="quiet compact-btn" onClick={() => void retryFailed()}>
            Retry {progress.failed} failed
          </button>
        )}
        {progress && progress.pending > 0 && (
          <button type="button" className="quiet compact-btn" onClick={toggle}>
            {paused ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>
      {message && <p className="sync-note enrich-note" role="alert">{message} <button type="button" onClick={() => void call().then(p => { setProgress(p); setMessage(''); }).catch(() => setMessage('Still unable to connect. Try again shortly.'))}>Retry connection</button></p>}
      {debug && (
        <p className="meta enrich-hint">
          Last batch: {debug.saved}/{debug.words} saved in {(debug.totalMs / 1000).toFixed(1)}s
          {' · '}select {(debug.selectMs / 1000).toFixed(1)}s
          {' · '}lookup {(debug.lookupMs / 1000).toFixed(1)}s
          {' · '}save {(debug.saveMs / 1000).toFixed(1)}s
          {' · '}count {(debug.countMs / 1000).toFixed(1)}s
          {debug.slowest ? ` · slowest “${debug.slowest.lemma}” ${(debug.slowest.totalMs / 1000).toFixed(1)}s (queue ${(debug.slowest.queueMs / 1000).toFixed(1)}s, dictionary ${(debug.slowest.httpMs / 1000).toFixed(1)}s, ${debug.slowest.status})` : ''}
          {debug.failed ? ` · ${debug.failed} lookup failed` : ''}
        </p>
      )}
      {progress && !progress.translator && (
        <p className="meta enrich-hint">Translation sync is managed separately in Admin Settings → Translation languages.</p>
      )}
      <details className="enrich-details"><summary>How word preparation works</summary><p className="meta">New words receive meanings, examples, related words and available translations automatically. Keep this page open while they prepare. You can pause and resume later.</p></details>
    </section>
  );
}
