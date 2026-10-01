const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const modules = new Map();
let allowWorkbook = false;
function load(file) {
  if (modules.has(file)) return modules.get(file).exports;
  const mod = { exports: {} };
  modules.set(file, mod);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const localRequire = (name) => {
    if (name === 'exceljs' || name === 'jszip') assert.ok(allowWorkbook, name + ' loaded before a spreadsheet action');
    return name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name);
  };
  vm.runInThisContext('(function(require,module,exports){' + code + '\n})', { filename: file })(localRequire, mod, mod.exports);
  return mod.exports;
}
(async () => {
  const lib = (name) => load(path.resolve(__dirname, '../src/lib/' + name + '.ts'));
  const vocab = lib('excel-vocab');
  const appendix = lib('excel-appendix');
  lib('excel-speech');
  const tracker = lib('school-tracker');
  const reports = lib('school-report');
  assert.equal(tracker.classLabel('VI', 'A'), 'VI-A');
  allowWorkbook = true;
  const blob = await vocab.buildVocabWorkbook({ words: [{ word: 'bridge', bucket: 'beginner' }] });
  const parsed = await vocab.parseVocabWorkbook(await blob.arrayBuffer());
  assert.ok(JSON.stringify(parsed).toLowerCase().includes('bridge'));
  const template = await appendix.buildAppendixTemplate();
  assert.ok(template.size > 0);
  const report = await reports.buildSchoolReport({ school: 'Test School', code: null, mode: 'class', needs_assignment: false, coverage: [], students: [] });
  assert.ok(report.size > 0);
  console.log('Admin helpers load without Excel/ZIP; workbook export and vocabulary round trip pass');
})().catch((error) => { console.error(error); process.exitCode = 1; });
