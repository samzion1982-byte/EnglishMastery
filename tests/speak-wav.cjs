const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');

const file = path.resolve(__dirname, '../src/lib/speak-wav.ts');
const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const wav = {};
vm.runInNewContext(code, { exports: wav, Blob }, { filename: file });

const samples = new Float32Array(16000);
for (let i = 0; i < samples.length; i += 1) samples[i] = Math.sin((i / 16000) * 440 * Math.PI * 2) * 0.2;
const blob = wav.encodeWav([samples], 16000);
assert.ok(blob.size > 44);
assert.equal(wav.wavDurationMs(blob), 1000);
console.log('speak wav ok');
