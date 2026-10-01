const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} }; cache.set(file, mod);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInThisContext('(function(require,module,exports){' + code + '\n})')(
    name => name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name), mod, mod.exports);
  return mod.exports;
}
const lib = name => load(path.resolve(__dirname, '../src/lib/' + name + '.ts'));
const { learnedNow } = lib('srs');
const { levelsOf, levelSession, buildSession, revisitLevel } = lib('learner-stats');
const yesterday = Date.UTC(2026, 9, 1, 8);
const today = yesterday + 86400000 + 1000;
const words = Array.from({ length: 60 }, (_, index) => ({ id: 'word-' + (index + 1), bucket: 'beginner' }));
const data = { words, progress: {}, profile: { track: 'beginner', batchSize: 50, dailyGoal: 20 }, activity: [] };
for (const word of words.slice(0, 5)) data.progress[word.id] = learnedNow(word.id, yesterday);
const before = JSON.stringify(data.progress);
let level = levelsOf(data, 'beginner', 50)[0];
assert.equal(level.learned, 5);
const revisits = revisitLevel(data, level);
assert.deepEqual(revisits, words.slice(0, 5).map(word => ({ kind: 'revisit', wordId: word.id })));
assert.deepEqual(revisitLevel(data, levelsOf(data, 'beginner', 50)[1]), []);
// Review includes learned words even before their scheduled quiz is due.
assert.equal(revisitLevel(data, level).length, 5);
assert.equal(JSON.stringify(data.progress), before);
const continued = levelSession(data, level, today);
assert.deepEqual(continued, words.slice(5, 15).map(word => ({ kind: 'learn', wordId: word.id })));
assert.deepEqual(buildSession('review', data, 'beginner', today).map(item => item.wordId), words.slice(0, 5).map(word => word.id));
assert.equal(JSON.stringify(data.progress), before);
// Repeated sessions must finish the level without pulling words from level 2.
let learned = 5;
while (learned < 50) {
  level = levelsOf(data, 'beginner', 50)[0];
  const items = levelSession(data, level, today);
  assert.ok(items.length > 0 && items.length <= 10);
  assert.ok(items.every(item => item.kind === 'learn' && !data.progress[item.wordId]));
  for (const item of items) data.progress[item.wordId] = learnedNow(item.wordId, today);
  learned += items.length;
}
assert.equal(learned, 50);
assert.ok(!data.progress['word-51']);
level = levelsOf(data, 'beginner', 50)[0];
assert.equal(level.state, 'done');
assert.ok(levelSession(data, level, today).every(item => item.kind === 'review'));
assert.equal(levelSession(data, levelsOf(data, 'beginner', 50)[1], today)[0].wordId, 'word-51');
console.log('Next-day continuation starts at word 6, completes remaining words in order, preserves reviews and saved progress.');
