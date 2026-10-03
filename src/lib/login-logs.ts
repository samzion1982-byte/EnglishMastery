export type LoginLog = {
  id: string; user_id: string | null; full_name: string; email: string; user_role: string;
  account_kind?: 'individual' | 'school' | 'console' | 'unknown';
  school_group?: 'student' | 'staff' | null; school_name?: string | null;
  trustgate_mode?: 'on' | 'bypass' | 'unknown';
  user_agent: string | null; login_at: string; last_seen_at: string;
  logout_at: string | null; end_reason: 'signout' | 'timeout' | null;
};

export function sessionStatus(row: LoginLog, now = Date.now()) {
  if (row.end_reason === 'signout') return 'Signed out';
  if (row.logout_at || now - Date.parse(row.last_seen_at) > 90000) return 'Disconnected';
  return 'Online';
}

export function sessionDuration(row: LoginLog) {
  const seconds = Math.max(0, Math.floor((Date.parse(row.logout_at || row.last_seen_at) - Date.parse(row.login_at)) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}m ${seconds % 60}s` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function sessionDevice(agent: string | null) {
  const ua = agent || '';
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
  return ua ? `${browser}${os ? ` / ${os}` : ''}` : 'Unavailable';
}

export function sessionCategory(row: LoginLog) {
  if (row.account_kind === 'individual') return 'Individual';
  if (row.account_kind === 'school') return row.school_group === 'student' ? 'School / Student' : row.school_group === 'staff' ? 'School / Staff' : 'School';
  return row.account_kind === 'console' ? 'Administration' : 'Unknown';
}
export function sessionTrustGate(row: LoginLog) {
  return row.trustgate_mode === 'on' ? 'On' : row.trustgate_mode === 'bypass' ? 'Bypass' : 'Unknown';
}
export function matchesLoginFilters(row: LoginLog, account: string, schoolGroup: string, gate: string) {
  return (account === 'All' || row.account_kind === account)
    && (account !== 'school' || schoolGroup === 'All' || row.school_group === schoolGroup)
    && (gate === 'All' || (row.trustgate_mode || 'unknown') === gate);
}
