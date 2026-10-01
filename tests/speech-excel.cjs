const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const ExcelJS = require('exceljs');

const root = path.resolve(__dirname, '..');
function load(name) {
  const source = path.join(root, 'src/lib', name);
  const code = ts.transpileModule(fs.readFileSync(source, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const file = path.join(__dirname, `.tmp-${name.replace('.ts', '')}.cjs`);
  fs.writeFileSync(file, code);
  return require(file);
}

const usage = load('speech-usage.ts');
const excel = load('excel-speech.ts');

const now = Date.parse('2026-09-30T12:00:00.000Z');
const rows = [
  {
    id: 'a', userId: 'u1', name: 'Asha', email: 'asha@school.test', school: 'North', classLabel: 'VI A',
    startedAt: '2026-09-30T11:50:00.000Z', finishedAt: '2026-09-30T11:50:20.000Z',
    model: 'whisper-large-v3', provider: 'groq', status: 'ok', audioBytes: 8000, audioMs: 20000,
    latencyMs: 1200, level: 'beginner', matched: 4, total: 5, httpStatus: 200,
  },
  {
    id: 'b', userId: 'u2', name: 'Ben', email: 'ben@school.test', school: 'South', classLabel: 'VII B',
    startedAt: '2026-09-30T11:50:05.000Z', finishedAt: '2026-09-30T11:50:25.000Z',
    model: 'whisper-large-v3', provider: 'groq', status: 'rate_limited', audioBytes: 4000, audioMs: 9000,
    latencyMs: 400, level: 'beginner', matched: null, total: 5, httpStatus: 429,
  },
];
const report = usage.summarizeSpeechUsage(rows, now, 0, 'whisper-large-v3');
const bytes = excel.buildSpeechWorkbook(rows, report);

bytes.then(async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  assert.deepEqual(workbook.worksheets.map((sheet) => sheet.name), ['Summary', 'Schools', 'Students', 'Hours', 'Checks']);
  assert.equal(workbook.getWorksheet('Summary').getCell('A1').value, 'Speech recognition');
  assert.equal(workbook.getWorksheet('Summary').getCell('B9').value, 2);
  assert.equal(workbook.getWorksheet('Schools').getCell('A2').value, 'North');
  assert.equal(workbook.getWorksheet('Checks').getCell('C2').value, 'Ben');
  assert.equal(workbook.getWorksheet('Checks').getCell('I2').value, 'Groq limit');
  assert.equal(workbook.getWorksheet('Checks').getCell('O3').value, 0.8);
  assert.equal(workbook.getWorksheet('Students').getCell('A2').value, 'Asha');
  console.log('speech workbook ok');
  fs.unlinkSync(path.join(__dirname, '.tmp-speech-usage.cjs'));
  fs.unlinkSync(path.join(__dirname, '.tmp-excel-speech.cjs'));
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
