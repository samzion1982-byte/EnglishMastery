const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('src/lib/access.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const result = { exports: {} };
vm.runInThisContext('(function(module,exports){' + code + '\n})')(result, result.exports);
const { canOpenAdminPage, SUPER_ONLY_PAGES } = result.exports;
for (const page of SUPER_ONLY_PAGES) {
  for (const role of ['admin1', 'user4', 'demo', 'user', 'admin', 'student', 'teacher', 'school_admin', null]) {
    for (const grants of [{}, { [page]: true }, { [page]: false }]) {
      assert.equal(canOpenAdminPage(role, page, grants), false, `${role} cannot open ${page}`);
      assert.equal(canOpenAdminPage(role, page, grants, 'principal'), false);
    }
  }
  assert.equal(canOpenAdminPage('super_admin', page, { [page]: false }), true);
}
assert.equal(canOpenAdminPage('admin1', 'appendix', {}), true);
assert.equal(canOpenAdminPage('admin1', 'appendix', { appendix: false }), false);
assert.equal(canOpenAdminPage('user4', 'appendix', { appendix: true }), true);
assert.equal(canOpenAdminPage('student', 'appendix', { appendix: true }), false);
assert.equal(canOpenAdminPage('school_admin', 'school-staff', { users: true }, 'principal'), true);
console.log('Access checks passed: Super Admin restrictions override grants; learning permissions still apply.');
assert.equal(canOpenAdminPage('admin1', 'reports', { reports: false }), false);
assert.equal(canOpenAdminPage('user4', 'reports', { reports: true }), true);
assert.equal(canOpenAdminPage('school_admin', 'reports', { reports: false }, 'principal'), false);
assert.equal(canOpenAdminPage('super_admin', 'reports', { reports: false }), true);

for (const page of ['users', 'logs', 'settings']) {
  assert.equal(canOpenAdminPage('admin1', page, { [page]: false }), false);
  assert.equal(canOpenAdminPage('user4', page, { [page]: true }), true);
  assert.equal(canOpenAdminPage('user4', page, { [page]: false }), false);
}

for (const role of ['admin1', 'user4', 'demo', 'user', 'admin']) {
  assert.equal(canOpenAdminPage(role, 'reports', {}), true);
  assert.equal(canOpenAdminPage(role, 'reports', { reports: true }), true);
  assert.equal(canOpenAdminPage(role, 'reports', { reports: false }), false);
}
assert.equal(canOpenAdminPage('student', 'reports', { reports: true }), false);
