const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const values = new Map();
const document = { cookie: '' };
const storage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
const mod = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/login-preference.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: mod.exports, localStorage: storage, document, window: { location: { protocol: 'https:' } } });
const pref = mod.exports;
assert.equal(pref.readLoginPreference(), null);
for (const intent of ['school', 'admin', 'individual']) {
  pref.rememberLoginPreference(intent);
  assert.equal(pref.readLoginPreference(), intent);
  assert.ok(document.cookie.includes('em-login-as=' + intent));
  assert.ok(document.cookie.includes('; Secure'));
}
values.set('em-login-as', 'invalid');
assert.equal(pref.readLoginPreference(), null);
storage.getItem = () => { throw Error('blocked'); };
storage.setItem = () => { throw Error('blocked'); };
assert.equal(pref.readLoginPreference(), null);
assert.doesNotThrow(() => pref.rememberLoginPreference('admin'));
assert.ok(document.cookie.includes('em-login-as=admin'));
const form = fs.readFileSync('src/app/login/login-form.tsx', 'utf8');
assert.equal((form.match(/rememberLoginPreference\(/g) || []).length, 1);
assert.ok(form.indexOf('rememberLoginPreference(') > form.indexOf("if (intent === 'individual' && role === 'student')"));
assert.ok(!form.includes('document.cookie ='));
console.log('Login preferences: all account types persist; invalid/blocked storage handled; saving occurs after login checks.');
