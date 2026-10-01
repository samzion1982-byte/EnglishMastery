'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SpeechReport, SpeechStatus, SpeechWindow } from '@/lib/speech-usage';

const STATUS: Record<SpeechStatus, string> = {
  running: 'In progress',
  ok: 'Heard',
  silent: 'Silent',
  error: 'Failed',
  capped: 'App limit',
  rate_limited: 'Groq limit',
};

function minutes(ms: number) {
  return `${(ms / 60000).toFixed(ms >= 60000 ? 1 : 2)} min`;
}

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function hourLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric' });
}

function size(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round(bytes / 1024)} KB`;
}

function wait(ms: number | null) {
  if (ms == null) return '—';
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}

export function SpeechLog() {
  const [report, setReport] = useState<SpeechReport | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    const tz = -new Date().getTimezoneOffset();
    try {
      const response = await fetch(`/api/admin/speech-usage?tz=${tz}`, { cache: 'no-store' });
      const payload = await response.json().catch(() => null) as { report?: SpeechReport; missing?: boolean; error?: string } | null;
      if (payload?.missing) {
        setMissing(true);
        setReport(null);
        setError('');
        return;
      }
      if (!response.ok || !payload?.report) {
        setError(payload?.error || 'Could not load the speech log.');
        return;
      }
      setMissing(false);
      setError('');
      setReport(payload.report);
    } catch {
      setError('Could not load the speech log.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const first = window.setTimeout(() => { void load(); }, 0);
    const timer = window.setInterval(() => { void load(); }, 20000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [load]);

  async function exportWorkbook() {
    setExporting(true);
    setError('');
    try {
      const tz = -new Date().getTimezoneOffset();
      const response = await fetch(`/api/admin/speech-usage?tz=${tz}&format=xlsx`, { cache: 'no-store' });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        setError(payload?.error || 'Could not export the workbook.');
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Speech recognition ${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Could not export the workbook.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="admin-workspace">
      <header className="workspace-heading speech-log-head">
        <div>
          <p>LOGS / SPEECH RECOGNITION</p>
          <h1>Speech recognition</h1>
          <span>
            {report
              ? `Groq ${report.configuredModel}. Speaking checks are metered by audio length and by how many students speak at once.`
              : 'Speaking checks are metered by audio length and by how many students speak at once.'}
          </span>
        </div>
        <div className="speech-log-actions">
          <button type="button" className="speech-excel" onClick={() => { void exportWorkbook(); }} disabled={!report || exporting}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="2" width="18" height="20" rx="2.5" fill="#fff" />
              <path fill="#185C37" d="M5 6h7.2v12H5z" />
              <path fill="#fff" d="M6.1 8.4h1.35l1.15 2 1.15-2h1.3L9.35 11.2l1.8 2.9H9.75l-1.15-1.95-1.15 1.95H6.05l1.8-2.9-1.75-2.8Z" />
              <path stroke="#217346" strokeWidth="1.3" strokeLinecap="round" d="M14.2 8.5h5.2M14.2 12h5.2M14.2 15.5h5.2" />
            </svg>
            {exporting ? 'Preparing workbook' : 'Export Excel'}
          </button>
          <button type="button" className="s-btn ghost" onClick={() => { setLoading(true); void load(); }} disabled={loading}>
            {loading ? 'Refreshing' : 'Refresh'}
          </button>
        </div>
      </header>

      {missing && (
        <section className="admin-card">
          <h2>The speech log is not installed yet</h2>
          <p>Run <code>supabase/migrations/20260930120000_speech_usage.sql</code> in the Supabase SQL editor, then refresh this page. Checks made after that are kept here.</p>
        </section>
      )}
      {error && <p className="notice error" role="alert">{error}</p>}

      {report && (
        <>
          <p className="speech-log-note">
            A Groq limit means Whisper refused the check because the current allowance was full. That count, the audio minutes, and the peak number of students speaking together are what a paid plan has to cover.
            Typical wait over the last 7 days is {wait(report.latencyMs.average)}. The slowest 5% took {wait(report.latencyMs.p95)}.
          </p>
          <div className="admin-overview">
            <article><span>Speaking now</span><strong>{report.liveUsers}</strong><em>{report.liveChecks === 1 ? '1 check in flight' : `${report.liveChecks} checks in flight`}</em></article>
            <article><span>Peak students, 24 hours</span><strong>{report.day.peakUsers}</strong><em>{report.day.peakChecks} overlapping checks</em></article>
            <article><span>Audio sent, 30 days</span><strong>{minutes(report.month.audioMs)}</strong><em>{report.month.requests} checks</em></article>
            <article><span>Groq limits, 30 days</span><strong>{report.outcomes.rate_limited}</strong><em>{report.outcomes.capped} stopped by the app limit</em></article>
            <article><span>Students, 30 days</span><strong>{report.month.users}</strong><em>{report.outcomes.ok} heard, {report.outcomes.silent} silent</em></article>
            <article><span>Failed checks, 30 days</span><strong>{report.outcomes.error}</strong><em>Heard checks that Groq could not score</em></article>
          </div>

          <WindowTable report={report} />
          <HourTable report={report} />
          <PeopleTable report={report} />
          <RecentTable report={report} />
        </>
      )}
    </div>
  );
}

function WindowTable({ report }: { report: SpeechReport }) {
  const columns: { label: string; window: SpeechWindow }[] = [
    { label: 'Last hour', window: report.hour },
    { label: 'Last 24 hours', window: report.day },
    { label: 'Last 7 days', window: report.week },
    { label: 'Last 30 days', window: report.month },
  ];
  const rows: { label: string; value: (item: SpeechWindow) => string }[] = [
    { label: 'Checks', value: (item) => String(item.requests) },
    { label: 'Students', value: (item) => String(item.users) },
    { label: 'Peak students at once', value: (item) => String(item.peakUsers) },
    { label: 'Peak overlapping checks', value: (item) => String(item.peakChecks) },
    { label: 'Audio sent to Groq', value: (item) => minutes(item.audioMs) },
  ];
  return (
    <section className="admin-card table-card">
      <h2>Volume</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Measure</th>
            {columns.map((column) => <th key={column.label}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              {columns.map((column) => <td key={column.label}>{row.value(column.window)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function HourTable({ report }: { report: SpeechReport }) {
  const rows = [...report.hours].reverse();
  return (
    <section className="admin-card table-card">
      <h2>Last 24 hours</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Hour</th>
            <th>Checks</th>
            <th>Students</th>
            <th>Peak at once</th>
            <th>Audio sent</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.start}>
              <td>{hourLabel(row.start)}</td>
              <td>{row.requests}</td>
              <td>{row.users}</td>
              <td>{row.peakUsers}</td>
              <td>{minutes(row.audioMs)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function PeopleTable({ report }: { report: SpeechReport }) {
  return (
    <section className="admin-card table-card">
      <h2>Students, last 30 days</h2>
      {report.people.length === 0 ? <p>No speaking checks yet.</p> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>School</th>
              <th>Class</th>
              <th>Checks</th>
              <th>Audio</th>
              <th>Groq limits</th>
              <th>App limits</th>
              <th>Failures</th>
              <th>Last check</th>
            </tr>
          </thead>
          <tbody>
            {report.people.map((person) => (
              <tr key={person.userId}>
                <td>{person.name}{person.email ? <small>{person.email}</small> : null}</td>
                <td>{person.school || '—'}</td>
                <td>{person.classLabel || '—'}</td>
                <td>{person.checks}</td>
                <td>{minutes(person.audioMs)}</td>
                <td>{person.groqLimits}</td>
                <td>{person.appLimits}</td>
                <td>{person.errors}</td>
                <td>{when(person.lastAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function RecentTable({ report }: { report: SpeechReport }) {
  return (
    <section className="admin-card table-card">
      <h2>Recent checks</h2>
      {report.recent.length === 0 ? <p>No speaking checks yet.</p> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Student</th>
              <th>School</th>
              <th>Level</th>
              <th>Model</th>
              <th>Audio</th>
              <th>Size</th>
              <th>Wait</th>
              <th>Result</th>
              <th>Keywords</th>
            </tr>
          </thead>
          <tbody>
            {report.recent.map((row) => (
              <tr key={row.id}>
                <td>{when(row.startedAt)}</td>
                <td>{row.name}</td>
                <td>{row.school || '—'}</td>
                <td>{row.level}</td>
                <td>{row.model}</td>
                <td>{minutes(row.audioMs)}</td>
                <td>{size(row.audioBytes)}</td>
                <td>{wait(row.latencyMs)}</td>
                <td>{STATUS[row.status]}</td>
                <td>{row.matched == null || row.total == null ? '—' : `${row.matched} / ${row.total}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
