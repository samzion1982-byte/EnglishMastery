'use client';
import { Icon } from './icon';
import { useCallback, useEffect, useRef, useState } from 'react';

type Coverage = { code: string; enabled: boolean; priority: number; total: number; translated: number; pending: number; processing: number; failed: number; empty: number };
type Status = { languages: Coverage[]; canManage: boolean; configured: boolean };
const NAMES: Record<string, string> = { ta: 'Tamil', hi: 'Hindi', ml: 'Malayalam', te: 'Telugu', fr: 'French', kn: 'Kannada' };
async function request(method = 'GET', body?: object) {
  const res = await fetch('/api/admin/translations', { method, cache: 'no-store', headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not load translation controls.');
  return data;
}
export function TranslationControls() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [running, setRunning] = useState(false);
  const [scope, setScope] = useState<string | null>(null);
  const stop = useRef(true);
  const alive = useRef(true);
  const load = useCallback(async () => { const data = await request(); if (alive.current) setStatus(data); }, []);
  useEffect(() => {
    alive.current = true;
    const check = () => { if (!document.hidden) void load().catch(e => { if (alive.current) setError(e.message); }); };
    check(); const interval = setInterval(check, 30000); document.addEventListener('visibilitychange', check);
    return () => { alive.current = false; stop.current = true; clearInterval(interval); document.removeEventListener('visibilitychange', check); };
  }, [load]);
  async function change(language: string, enabled: boolean) {
    setBusy(language); setError('');
    try { await request('PATCH', { language, enabled }); await load(); setNote(`${NAMES[language]} ${enabled ? 'enabled for the next sync' : 'paused; saved translations remain available'}.`); }
    catch (e) { setError((e as Error).message); } finally { setBusy(''); }
  }
  async function sync(language?: string) {
    if (running || !stop.current) return;
    stop.current = false; setScope(language ?? null); setRunning(true); setError(''); setNote(language ? `Syncing ${NAMES[language]} only…` : 'Syncing missing translations in language priority order…');
    try {
      while (!stop.current && alive.current) {
        const result = await request('POST', { action: 'sync', ...(language ? { language } : {}) }); await load();
        if (!result.processed) { if (alive.current) setNote(`${language ? NAMES[language] : 'Enabled languages'} sync check complete. No unclaimed missing words are ready. Review any reserved, failed, or empty results below.`); break; }
        if (alive.current) setNote(`${NAMES[result.language]}: saved a batch of ${result.processed} words.`);
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    } catch (e) { if (alive.current) { setError((e as Error).message); await load().catch(() => {}); } }
    finally { stop.current = true; if (alive.current) { setRunning(false); setScope(null); } }
  }
  async function retry(language: string) {
    if (!window.confirm('Release failed, interrupted, and no-result words for another sync? Azure may have counted a previous request. Completed translations will not be repeated.')) return;
    setBusy(language); setError('');
    try { await request('POST', { action: 'retry', language }); await load(); setNote('Those words are pending again. Sync to request them once more.'); }
    catch (e) { setError((e as Error).message); } finally { setBusy(''); }
  }
  return <section className="settings-panel" id="languages">
    <h2>Translation languages</h2>
    <p>Enable the languages you want to translate this month. Use the sync icon beside a language switch to translate that language independently, or sync all enabled languages in priority order. Turning one off keeps its saved meanings. Student lookups never spend Azure credits.</p>
    <p>Coverage is saved meanings divided by active vocabulary words, not your remaining Azure quota. New words appear as pending on each check.</p>
    <div className="translation-actions">
      <button type="button" disabled={running || !!busy || !status?.canManage || !status?.configured || !status.languages.some(l => l.enabled && l.pending > 0)} onClick={() => sync()}>Sync enabled languages</button>
      {running && <button type="button" onClick={() => { stop.current = true; setNote('Stopping after the current batch is saved…'); }}>Stop after this batch</button>}
      <button type="button" disabled={!!busy} onClick={() => { setError(''); void load().then(() => setNote('Coverage checked against Supabase.')).catch(e => setError(e.message)); }}>Check coverage</button>
    </div>
    {error && <p role="alert" className="translation-error">{error}</p>}
    <p role="status">{note || (!status && !error ? 'Loading translation coverage…' : '')}</p>
    {status && <>
      {!status.configured && <p>Azure Translator is not configured. Coverage checks and switches remain available.</p>}
      {!status.canManage && <p>Only Super Admin can change languages or start a paid-service sync.</p>}
      <div className="translation-grid">{status.languages.map(l => {
        const percent = l.total ? Math.floor(100 * l.translated / l.total) : 0;
        return <article key={l.code} className={`translation-language${l.enabled ? ' enabled' : ''}`}>
          <div className="translation-title"><h3>{NAMES[l.code]}</h3><div className="translation-title-actions"><button type="button" className="translation-sync-icon" title={running && scope === l.code ? 'Stop after this batch' : !l.enabled ? 'Enable this language to sync' : !l.pending ? (l.empty ? `${l.empty} words returned no translation. Release them below, then sync.` : 'No pending translations') : `Sync ${NAMES[l.code]} only`} aria-label={running && scope === l.code ? `Stop ${NAMES[l.code]} sync after this batch` : `Sync ${NAMES[l.code]} only`} disabled={running && scope === l.code ? false : running || !!busy || !status.canManage || !status.configured || !l.enabled || !l.pending} onClick={() => { if (running && scope === l.code) { stop.current = true; setNote(`Stopping ${NAMES[l.code]} after the current batch is saved…`); } else { void sync(l.code); } }}>{running && scope === l.code ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg> : <Icon kind="repeat" />}</button><button type="button" role="switch" aria-checked={l.enabled} aria-label={`Enable ${NAMES[l.code]} translation`} disabled={!status.canManage || !!busy} onClick={() => change(l.code, !l.enabled)}><span aria-hidden="true" /></button></div></div>
          <span className="translation-pill">{l.total ? `${percent}% translated` : 'No words yet'} · {l.enabled ? 'Enabled' : 'Paused'}</span>
          <progress max={l.total || 1} value={l.translated} aria-label={`${NAMES[l.code]} translation coverage`} />
          <p>{l.translated.toLocaleString()} / {l.total.toLocaleString()} words saved</p>
          <small>{l.pending} pending · {l.processing} reserved · {l.failed} failed · {l.empty} no result</small>

          {!l.enabled && <small>Turn the switch on to allow sync.</small>}
          {(l.failed > 0 || l.processing > 0 || l.empty > 0) && status.canManage && <button type="button" disabled={running || !!busy} onClick={() => retry(l.code)}>{l.empty > 0 && !l.failed && !l.processing ? `Retry ${l.empty} with no result` : 'Review & release retries'}</button>}
        </article>;
      })}</div>
      <p>One sync runs at a time. Individual sync does not change other language switches. Sync runs while this page is open, stops on a service error, and checks switches between batches. An in-flight batch may finish after a switch is turned off. Words Azure returned blank stay out of the queue until you release them.</p>
    </>}
  </section>;
}
