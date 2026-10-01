const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const storage = new Map();
const localStorage = {
  getItem(key) { return storage.get(key) ?? null; },
  setItem(key, value) { storage.set(key, value); },
};
const file = path.resolve(root, 'src/lib/speaking-lines.ts');
const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const lines = {};
vm.runInNewContext(code, { exports: lines, localStorage }, { filename: file });

const { beginnerLevels, keywordScore, paintPassage, paintFollow, followTranscript, matchSpeech, isSilentTake, speakMedal, saveSpeakAward, readSpeakAward } = lines;

const vocab = ['bridge', 'river', 'garden', 'pencil', 'market', 'cloud', 'stone'].map((lemma, index) => ({ id: 'w'+index, word: lemma, lemma, bucket: 'beginner' }));
const levels = beginnerLevels(vocab, new Set(['w0']), () => 0.999);
assert.equal(levels.length, 5);
assert.equal(levels[0].fresh, false);
assert.ok(levels[0].keywords.some(word => word.id === 'w0'));
assert.deepEqual(new Set(levels[0].keywords.map((word) => word.word)), new Set(['through', 'narrow', 'bridge', 'branches', 'carefully']));
const noisy = beginnerLevels([...vocab, { id: 'glue', word: 'after', lemma: 'after', bucket: 'beginner' }, { id: 'pronoun', word: 'she', lemma: 'she', bucket: 'beginner' }], new Set(), () => 0.999);
assert.equal(noisy[0].keywords.some((word) => word.word === 'after' || word.word === 'she'), false);
for (const source of [vocab, [], ['range','seek','sick','thick','ensure'].map(word => ({id:word,word,lemma:word,bucket:'beginner'}))]) {
 const set = beginnerLevels(source, new Set(), () => 0.25);
 assert.equal(set.length,5);
 assert.equal(new Set(set.flatMap(level=>level.keywords.map(word=>word.word))).size,25);
 set.forEach((level,index)=>{
   assert.equal(level.level,index+1);
   assert.equal(level.keywords.length,5);
   assert.ok(lines.keywordsInPassage(level.text,level.keywords.map(word=>word.word)));
   assert.equal(level.text,levels[index].text,'arbitrary words cannot corrupt story meaning');
   assert.ok(lines.targetWords(level.text).length<=55,'beginner reading length stays manageable');
 });
}
const passage=levels[0];
const followed=paintFollow(passage.text,2);
assert.equal(followed.filter(token=>token.hit).map(token=>token.text).join(','),'After,lunch');
assert.ok(followed.every(token=>!token.keyword&&!token.next));
assert.equal(followTranscript(passage.text,'Kim walked outside'),0);
assert.equal(followTranscript(passage.text,'After lunch Kim'),3);
assert.equal(keywordScore(['garden','market'],'garden').matched,1);
const painted=paintPassage(passage.text,'bridge',['bridge']);
assert.equal(painted.find(token=>token.text==='bridge').hit,true);
assert.equal(painted.find(token=>token.text==='Kim').keyword,false);

const full = matchSpeech('Please open the window.', 'Please open the window.');
assert.equal(full.matched, 4);
assert.ok(full.words.every((word) => word.hit));

const shifted = matchSpeech('I packed my bag before school.', 'um I packed the bag before school');
assert.equal(shifted.words.map((word) => (word.hit ? '1' : '0')).join(''), '110111');
assert.equal(shifted.matched, 5);

const fold = matchSpeech("Don't forget the bag.", 'Dont forget the bag');
assert.equal(fold.matched, 4);

const order = matchSpeech('We ran and laughed in the green park.', 'We laughed and ran in the green park.');
assert.equal(order.words.find((word) => word.text === 'ran').hit, true);
assert.equal(order.words.find((word) => word.text === 'laughed').hit, true);

assert.equal(isSilentTake('Please open the window.', '', 1), true);
assert.equal(isSilentTake('Please open the window.', 'Thanks for watching.', 0.9), true);
assert.equal(isSilentTake('Please open the window.', 'Please open the door.', 0.1), false);
assert.equal(matchSpeech('Please open the window.', 'Please open the door.').words.at(-1).hit, false);

assert.equal(speakMedal(5, 5).medal, 'Gold');
assert.equal(speakMedal(4, 5).medal, 'Silver');
assert.equal(speakMedal(3, 5).medal, 'Bronze');
assert.equal(speakMedal(2, 5).medal, 'Keep going');
assert.equal(speakMedal(33, 35).medal, 'Gold');
assert.equal(speakMedal(26, 35).medal, 'Silver');
assert.equal(speakMedal(20, 35).medal, 'Bronze');
assert.equal(speakMedal(10, 35).medal, 'Keep going');

assert.equal(saveSpeakAward('beginner', 20, 35).medal, 'Bronze');
assert.equal(saveSpeakAward('beginner', 10, 35).medal, 'Bronze');
assert.equal(readSpeakAward('beginner').total, 20);
assert.equal(saveSpeakAward('beginner', 33, 35).medal, 'Gold');
assert.equal(readSpeakAward('beginner').medal, 'Gold');

console.log('speaking lines ok');

assert.equal(followTranscript('Before school Maya practised her new words', 'Before school my practiced her new words'), 7);
assert.equal(followTranscript('Before school Maya practised her new words', 'Before school practised her'), 5);
assert.equal(followTranscript('Before school Maya practised her new words', 'Before school her'), 2, 'one stray word cannot trigger recovery');
assert.equal(followTranscript('Before school Maya practised her new words', 'Before new words'), 1, 'no long-distance jumps');
assert.equal(followTranscript('Before school Maya practised', 'school Maya practised'), 0, 'first word still anchors passage');
assert.equal(followTranscript('He opened his notebook', 'he opened his note book'), 4);
assert.equal(followTranscript('She ate ice cream today', 'she ate icecream today'), 5);
assert.equal(keywordScore(['window'], 'the next word').matched, 0, 'visual recovery cannot grant keyword credit');
assert.equal(keywordScore(['notebook'], 'he opened his note book').matched, 1);
assert.equal(keywordScore(['apple', 'basket'], 'she shared an apple').matched, 1);

// Harder content must still report genuine omissions and substitutions as misses.
for (const level of levels) {
 const keywords=level.keywords.map(item=>item.word);
 assert.equal(keywordScore(keywords,level.text).matched,5);
 for (const missing of keywords) {
  const without=lines.targetWords(level.text).filter(word=>word.toLowerCase()!==missing).join(' ');
  const score=keywordScore(keywords,without);
  assert.equal(score.matched,4);
  assert.equal(score.words.find(item=>item.word===missing).hit,false);
 }
 assert.equal(keywordScore(keywords,'I cannot remember this passage').matched,0);
}
assert.equal(keywordScore(['through','narrow','bridge','branches','carefully'],'through narrow fridge branches carefully').words[2].hit,false);

const exactHits=new Set();
assert.equal(followTranscript('After lunch Kim walked through the park','After lunch Kim walked the park',0,['through'],exactHits),7);
assert.equal(exactHits.has(4),false,'skipped keyword is not marked heard');
assert.equal(exactHits.has(5),true);
for(const level of levels){
 const justKeywords=level.keywords.map(word=>word.word).join(' ');
 const coverage=matchSpeech(level.text,justKeywords);
 assert.ok(coverage.matched/coverage.total<0.7,'keyword-only attempt is incomplete');
 assert.equal(matchSpeech(level.text,level.text).matched,lines.targetWords(level.text).length);
}

assert.equal(lines.passageCoverage('She opened her notebook', 'she opened her note book').matched,4);
assert.equal(lines.passageCoverage('We ate ice cream', 'we ate icecream').matched,4);
assert.equal(lines.passageCoverage('the the the', 'the').matched,1);
assert.equal(lines.passageCoverage('She practised slowly', 'um she practiced very slowly').matched,3);
assert.equal(lines.passageCoverage('Read these words', '').incomplete,true);

const droppedPhrase=levels[0].text.replace('her brother. They crossed ', '');
const recoveredHits=new Set();
assert.equal(followTranscript(levels[0].text,droppedPhrase,0,[],recoveredHits),lines.targetWords(levels[0].text).length,'recover after a lost four-word phrase');
for(const index of [8,9,10,11]) assert.equal(recoveredHits.has(index),false,'lost words are not heard');
assert.equal(followTranscript('After lunch Kim walked through the park with her brother','After lunch with her'),2,'two common words cannot trigger a distant jump');
assert.equal(followTranscript('After lunch Kim walked near the old bridge past the old bridge','After lunch the old bridge'),2,'ambiguous anchor cannot skip ahead');
