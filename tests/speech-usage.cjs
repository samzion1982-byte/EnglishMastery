const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');

const file = path.resolve(__dirname, '../src/lib/speech-usage.ts');
const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const usage = {};
vm.runInNewContext(code, { exports: usage }, { filename: file });
const { summarizeSpeechUsage } = usage;

const now = Date.parse('2026-09-30T12:00:00.000Z');
function row(patch) {
  return {
    id: patch.id,
    userId: patch.userId,
    name: patch.name,
    email: '',
    school: patch.school || '',
    classLabel: '',
    startedAt: patch.startedAt,
    finishedAt: patch.finishedAt ?? null,
    model: 'whisper-large-v3',
    provider: 'groq',
    status: patch.status,
    audioBytes: 8000,
    audioMs: patch.audioMs ?? 10000,
    latencyMs: patch.latencyMs ?? 1200,
    level: 'beginner',
    matched: patch.matched ?? 4,
    total: 5,
    httpStatus: 200,
  };
}

const report = summarizeSpeechUsage([
  row({ id: 'a', userId: 'u1', name: 'Asha', startedAt: '2026-09-30T11:50:00.000Z', finishedAt: '2026-09-30T11:50:20.000Z', status: 'ok', audioMs: 20000 }),
  row({ id: 'b', userId: 'u2', name: 'Ben', startedAt: '2026-09-30T11:50:05.000Z', finishedAt: '2026-09-30T11:50:25.000Z', status: 'silent', audioMs: 15000 }),
  row({ id: 'c', userId: 'u1', name: 'Asha', startedAt: '2026-09-30T10:00:00.000Z', finishedAt: '2026-09-30T10:00:10.000Z', status: 'rate_limited', audioMs: 9000 }),
  row({ id: 'd', userId: 'u3', name: 'Cara', startedAt: '2026-09-30T11:59:40.000Z', status: 'running', audioMs: 4000 }),
  row({ id: 'e', userId: 'u2', name: 'Ben', school: 'North', startedAt: '2026-09-29T08:00:00.000Z', finishedAt: '2026-09-29T08:00:12.000Z', status: 'error', audioMs: 12000 }),
], now, 0, 'whisper-large-v3');

assert.equal(report.liveUsers, 1);
assert.equal(report.liveChecks, 1);
assert.equal(report.hour.peakUsers, 2);
assert.equal(report.hour.requests, 2);
assert.equal(report.hour.audioMs, 35000);
assert.equal(report.outcomes.rate_limited, 1);
assert.equal(report.outcomes.error, 1);
assert.equal(report.outcomes.ok, 1);
assert.equal(report.people[0].name, 'Asha');
assert.equal(report.people.find((person) => person.userId === 'u2').school, 'North');
assert.equal(report.hours.length, 24);
assert.equal(report.recent[0].id, 'd');
console.log('speech usage ok');
