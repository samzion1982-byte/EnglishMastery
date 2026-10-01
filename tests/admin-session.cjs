const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(file, deps) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  vm.runInThisContext('(function(require,module,exports){' + code + '\n})')((name) => { if (!(name in deps)) throw Error(name); return deps[name]; }, mod, mod.exports);
  return mod.exports;
}
const access = { isAdminStaff: role => role === 'super_admin', isSchoolStaff: role => role === 'school_staff' };
const saved = [process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY];
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.invalid';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test';
let user = { id: 'real-user' }, profile = { role: 'super_admin', nickname: 'Admin', is_active: true }, authCalls = 0, profileCalls = 0, fallbackCalls = 0;
let forwarded;
const response = (options = {}) => ({ ...options, cookies: { values: [], set(item, value) { this.values.push(typeof item === 'string' ? { name: item, value } : item); }, getAll() { return this.values; } } });
const proxy = load('src/proxy.ts', {
  '@/lib/access': access,
  'next/server': { NextResponse: { next: options => response(options), redirect: url => response({ redirect: url.pathname }) } },
  '@supabase/ssr': { createServerClient: (url, key, options) => ({
    auth: { getUser: async () => { authCalls++; options.cookies.setAll([{ name: 'refresh', value: 'updated', options: {} }]); return { data: { user } }; }, signOut: async () => {} },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => { profileCalls++; return { data: profile }; } }) }) }),
  }) },
}).proxy;
const session = load('src/lib/admin-session.ts', {
  react: { cache: fn => fn }, 'next/headers': { headers: async () => forwarded }, './access': access,
  './supabase-server': { getSessionRole: async () => { fallbackCalls++; return { user: null, role: null }; } },
}).getAdminSessionRole;
function request() {
  const url = new URL('http://localhost/admin/overview'); url.clone = () => new URL(url);
  return { headers: new Headers({ 'x-em-admin-session': encodeURIComponent(JSON.stringify({ user: { id: 'forged' }, role: 'super_admin', active: true, mustChange: false })) }),
    cookies: { getAll: () => [], set() {} }, nextUrl: url };
}
(async () => {
  let result = await proxy(request());
  forwarded = result.request.headers;
  assert.equal((await session()).user.id, 'real-user');
  assert.equal(authCalls, 1); assert.equal(profileCalls, 1); assert.equal(fallbackCalls, 0);
  assert.equal(result.cookies.getAll()[0].value, 'updated');
  profile = { role: 'super_admin', is_active: false };
  assert.equal((await proxy(request())).redirect, '/login');
  profile = { role: 'super_admin', is_active: true, must_change_password: true };
  assert.equal((await proxy(request())).redirect, '/change-password');
  user = null;
  assert.equal((await proxy(request())).redirect, '/login');
  user = { id: 'student' }; profile = { role: 'other' };
  result = await proxy(request());
  assert.equal(result.request.headers.get('x-em-admin-session'), null);
  forwarded = new Headers(); await session(); assert.equal(fallbackCalls, 1);
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  result = await proxy(request()); assert.equal(result.request.headers.get('x-em-admin-session'), null);
  console.log('Admin auth: one user/profile lookup, forged header discarded, refresh preserved, inactive/password/login guards pass');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => {
  for (const [index, name] of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'].entries()) {
    if (saved[index] === undefined) delete process.env[name]; else process.env[name] = saved[index];
  }
});
