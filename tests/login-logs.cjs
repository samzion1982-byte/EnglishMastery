const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(file, deps = {}) {
 const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
 const mod = { exports: {} };
 vm.runInThisContext('(function(require,module,exports){' + code + '\n})')(name => {
  if (!(name in deps)) throw Error(name); return deps[name];
 }, mod, mod.exports);
 return mod.exports;
}
const { sessionStatus, sessionDuration, sessionDevice } = load('src/lib/login-logs.ts');
const row = { login_at: '2026-10-03T10:00:00Z', last_seen_at: '2026-10-03T10:01:30Z', logout_at: null, end_reason: null };
assert.equal(sessionStatus(row, Date.parse('2026-10-03T10:02:00Z')), 'Online');
assert.equal(sessionStatus(row, Date.parse('2026-10-03T10:03:01Z')), 'Disconnected');
assert.equal(sessionDuration(row), '1m 30s', 'Disconnected duration does not keep growing');
assert.equal(sessionStatus({ ...row, logout_at: row.last_seen_at, end_reason: 'timeout' }), 'Disconnected');
assert.equal(sessionStatus({ ...row, logout_at: row.last_seen_at, end_reason: 'signout' }), 'Signed out');
assert.equal(sessionDuration({ ...row, logout_at: '2026-10-03T12:10:00Z' }), '2h 10m');
assert.equal(sessionDuration({ ...row, last_seen_at: '2026-10-03T09:00:00Z' }), '0s');
assert.equal(sessionDevice('Mozilla Windows Chrome/1 Edg/1'), 'Edge / Windows');
assert.equal(sessionDevice('Mozilla Android Chrome/1'), 'Chrome / Android');
assert.equal(sessionDevice(null), 'Unavailable');
const access = load('src/lib/access.ts');
let auth = { user: null, active: false, role: null }, grants = {}, calls = 0, rpcError = null;
const api = load('src/app/api/admin/login-logs/route.ts', {
 'next/server': { NextResponse: { json: (body, options = {}) => ({ body, ...options }) } },
 '@/lib/access': access,
 '@/lib/grants': { loadRoleGrants: async () => grants },
 '@/lib/supabase-server': { getSessionRole: async () => auth, createServerSupabase: async () => ({ rpc: async () => { calls++; return { data: [row], error: rpcError }; } }) },
}).GET;
(async () => {
 assert.equal((await api()).status, 403); assert.equal(calls, 0);
 auth = { user: { id: 'u' }, active: true, role: 'user4' };
 grants = { logs: false }; assert.equal((await api()).status, 403); assert.equal(calls, 0);
 grants = { logs: true }; assert.deepEqual((await api()).body.rows, [row]);
 auth.active = false; assert.equal((await api()).status, 403);
 auth = { user: { id: 's' }, active: true, role: 'student' };
 assert.equal((await api()).status, 403, 'Student cannot grant themselves log access');
 auth = { user: { id: 'a' }, active: true, role: 'super_admin' }; grants = { logs: false };
 assert.deepEqual((await api()).body.rows, [row]);
 rpcError = { message: 'Could not find function public.login_session_rows in the schema cache' };
 assert.equal((await api()).status, 503);
 console.log('Login logs: status, observed duration, browser detection, role guards and migration errors passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });

const { matchesLoginFilters, sessionCategory, sessionTrustGate } = load('src/lib/login-logs.ts');
const individual = { ...row, user_role: 'admin1', account_kind: 'individual', trustgate_mode: 'on' };
const student = { ...row, account_kind: 'school', school_group: 'student', trustgate_mode: 'on' };
const staff = { ...row, account_kind: 'school', school_group: 'staff', trustgate_mode: 'bypass' };
assert.equal(sessionCategory(individual), 'Individual', 'Classification uses licence membership, not role');
assert.equal(matchesLoginFilters(student, 'school', 'student', 'on'), true);
assert.equal(matchesLoginFilters(staff, 'school', 'student', 'All'), false);
assert.equal(matchesLoginFilters(staff, 'school', 'staff', 'bypass'), true);
assert.equal(matchesLoginFilters(individual, 'individual', 'staff', 'on'), true, 'School filter does not affect individuals');
assert.equal(matchesLoginFilters(row, 'All', 'All', 'bypass'), false, 'Legacy sessions are not falsely marked bypassed');
assert.equal(sessionTrustGate(row), 'Unknown');
assert.equal(sessionTrustGate(staff), 'Bypass');
assert.equal(sessionTrustGate(student), 'On');
