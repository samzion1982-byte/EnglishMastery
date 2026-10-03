'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ROLE_LABELS } from '@/lib/access';
import { matchesLoginFilters, sessionCategory, sessionTrustGate, sessionDevice, sessionDuration, sessionStatus, type LoginLog } from '@/lib/login-logs';

function when(value: string | null) {
  return value ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';
}

export function LoginLogTable() {
  const [rows, setRows] = useState<LoginLog[]>([]);
  const [checkedAt, setCheckedAt] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [account, setAccount] = useState('All');
  const [schoolGroup, setSchoolGroup] = useState('All');
  const [gate, setGate] = useState('All');
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch('/api/admin/login-logs', { cache: 'no-store', signal });
      const payload = await response.json();
      if (!response.ok) throw Error(payload.error || 'Could not load login sessions.');
      setRows(payload.rows);
      setCheckedAt(payload.checkedAt);
      setError('');
    } catch (err) {
      if (!signal?.aborted) setError(err instanceof Error ? err.message : 'Could not load login sessions.');
    } finally { if (!signal?.aborted) setLoading(false); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    const timer = window.setInterval(() => void load(controller.signal), 30000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [load]);
  const filtered = useMemo(() => rows.filter(row => {
    const text = `${row.full_name} ${row.email} ${ROLE_LABELS[row.user_role] || row.user_role} ${row.school_name || ''}`.toLowerCase();
    return matchesLoginFilters(row, account, schoolGroup, gate) && text.includes(search.trim().toLowerCase()) && (status === 'All' || sessionStatus(row, checkedAt) === status);
  }), [rows, search, status, checkedAt, account, schoolGroup, gate]);
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 25));
  const currentPage = Math.min(page, pageCount - 1);
  function exportCsv() {
    const cells = (value: string) => '"' + (/^[=+@-]/.test(value) ? "'" : '') + value.replaceAll('"', '""') + '"';
    const content = [['User','Email','Role','Account type','School','TrustGate','Login time','Logout time','Last seen','Duration','Status','Browser / system'],
      ...filtered.map(row => [row.full_name,row.email,ROLE_LABELS[row.user_role] || row.user_role,sessionCategory(row),row.school_name || '',sessionTrustGate(row),when(row.login_at),when(row.logout_at),when(row.last_seen_at),sessionDuration(row),sessionStatus(row,checkedAt),sessionDevice(row.user_agent)])]
      .map(row => row.map(cells).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'English-Mastery-login-logs.csv'; link.click();
    URL.revokeObjectURL(url);
  }
  return <section className="login-log-section" aria-busy={loading}>
    <h2>User login sessions</h2>
    <p>Latest 1,000 sessions from the last 31 days. Duration measures the observed session, including idle time. Updates every 30 seconds.</p>
    <div className="login-log-controls">
      <label>Search users<input value={search} onChange={event => { setSearch(event.target.value); setPage(0); }} placeholder="Name, email, role or school" /></label>
      <label>Account type<select value={account} onChange={event => { setAccount(event.target.value); setSchoolGroup('All'); setPage(0); }}>
        <option value="All">All accounts</option><option value="individual">Individual</option><option value="school">School</option><option value="console">Administration</option><option value="unknown">Unknown</option>
      </select></label>
      {account === 'school' ? <label>School users<select value={schoolGroup} onChange={event => { setSchoolGroup(event.target.value); setPage(0); }}>
        <option value="All">Students and staff</option><option value="student">Student</option><option value="staff">Staff</option>
      </select></label> : null}
      <label>TrustGate<select value={gate} onChange={event => { setGate(event.target.value); setPage(0); }}>
        <option value="All">All</option><option value="on">On</option><option value="bypass">Bypass</option><option value="unknown">Unknown</option>
      </select></label>
      <label>Status<select value={status} onChange={event => { setStatus(event.target.value); setPage(0); }}>
        {['All','Online','Signed out','Disconnected'].map(value => <option key={value}>{value}</option>)}
      </select></label>
      <button type="button" onClick={() => void load()}>Refresh</button>
      <button type="button" disabled={!filtered.length} onClick={exportCsv}>Export CSV</button>
    </div>
    {error ? <p className="notice error" role="alert">{error}</p> : null}
    <p>{rows.filter(row => sessionStatus(row,checkedAt) === 'Online').length} online sessions · {filtered.length} matching sessions</p>
    <div className="login-log-scroll">
      <table className="login-log-table"><thead><tr>
        {['User','Role','Account type','TrustGate','Login time','Logout time','Last seen','Duration','Status','Browser / system'].map(label => <th key={label}>{label}</th>)}
      </tr></thead><tbody>
        {filtered.slice(currentPage * 25, (currentPage + 1) * 25).map(row => <tr key={row.id}>
          <td>{row.full_name}<small>{row.email}</small></td><td>{ROLE_LABELS[row.user_role] || row.user_role}</td>
          <td>{sessionCategory(row)}{row.school_name ? <small>{row.school_name}</small> : null}</td><td>{sessionTrustGate(row)}</td>
          <td>{when(row.login_at)}</td><td>{row.end_reason === 'signout' ? when(row.logout_at) : '—'}</td><td>{when(row.last_seen_at)}</td>
          <td>{sessionDuration(row)}</td><td>{sessionStatus(row,checkedAt)}</td><td>{sessionDevice(row.user_agent)}</td>
        </tr>)}
        {!filtered.length ? <tr><td colSpan={10}>{loading ? 'Loading sessions…' : 'No matching login sessions.'}</td></tr> : null}
      </tbody></table>
    </div>
    <div className="login-log-controls">
      <button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button>
      <span>Page {currentPage + 1} of {pageCount}</span>
      <button type="button" disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>Next</button>
    </div>
    <p>TrustGate On records an enforced companion or approved-device check. Bypass means TrustGate was not required for that login. Older sessions without a recorded method show Unknown.</p>
    <p>Disconnected means updates stopped for more than 90 seconds. Its duration ends at the last update; this is not an exact browser-close time.</p>
  </section>;
}
