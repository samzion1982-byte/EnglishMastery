const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
const storage = new Map();
let blockedStorage = false;
const localStorage = {
  getItem(key) { if (blockedStorage) throw Error('blocked'); return storage.get(key) ?? null; },
  setItem(key, value) { if (blockedStorage) throw Error('blocked'); storage.set(key, value); },
};
function load(relative) {
  const file = path.resolve(root, relative);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, localStorage, require: name => name.startsWith('.') ? load(path.relative(root, path.resolve(path.dirname(file), name + '.ts'))) : require(name) }, { filename:file });
  return exports;
}
const { BEGINNER_LESSONS: lessons, BEGINNER_UNITS: units } = load('src/lib/beginner-catalog.ts');
const engine = load('src/lib/beginner-learning.ts');
const course = load('src/lib/grammar-course.ts');
const original = load('src/lib/grammar-catalog.ts');
assert.equal(lessons.length,41);
assert.equal(lessons.filter(l=>l.kind==='concept').length,35);
assert.equal(lessons.flatMap(l=>l.tasks).length,287);
assert.equal(units.length,6);
assert.equal(new Set(units.flatMap(u=>u.lessonIds)).size,41);
assert.equal(course.lessonsFor('beginner')[0].id,'INTRO-04');
assert.equal(lessons.find(l=>l.id==='INTRO-01').tasks.length,0);
assert.equal(units.find(u=>u.number===1).lessonIds[0],'BEG-01');
assert.equal(units.find(u=>u.number===1).title,'Foundations');
assert.equal(course.lessonsFor('beginner').at(-1).id,'FINAL-01');
for (const id of ['REVIEW-02','REVIEW-03','REVIEW-04','REVIEW-05','REVIEW-06','FINAL-01']) {
  const review = lessons.find(item => item.id === id);
  assert.match(review.video.url, /^https:\/\//);
  assert.ok(review.video.publisher && review.video.focus && review.video.recap.length >= 4);
  if (review.video.youtubeId) assert.match(review.video.youtubeId, /^[\w-]{11}$/);
  const reviewSteps = engine.beginnerSteps(review);
  const videoAt = reviewSteps.findIndex(step => step.kind === 'video');
  const quizAt = reviewSteps.findIndex(step => step.kind === 'task');
  assert.ok(videoAt >= 0 && videoAt < quizAt, id);
}
const partsLesson = engine.beginnerSteps(lessons.find(item => item.id === 'BEG-01'));
assert.equal(partsLesson[0].title, 'Eight parts of speech');
assert.equal(partsLesson[0].examples.join('|'), 'Noun|Pronoun|Verb|Adjective|Adverb|Preposition|Conjunction|Interjection');
assert.match(partsLesson[0].paragraphs.join(' '), /eight parts of speech/);
for (const name of ['Noun','Pronoun','Verb','Adjective','Adverb','Preposition','Conjunction','Interjection']) {
  assert.equal(partsLesson.filter(step => step.kind === 'read' && step.title === name).length, 1, name);
}
const partsVideo = partsLesson.find(step => step.kind === 'video');
assert.equal(partsVideo.youtubeId, 'ZqLeGm4k6CU');
assert.ok(partsLesson.findIndex(step => step.kind === 'video') < partsLesson.findIndex(step => step.kind === 'task'));
assert.equal(partsLesson.some(step => step.kind === 'visual'), false);
assert.ok(partsLesson.filter(step => step.title === 'Noun')[0].card);
for (const [id, names] of [['BEG-02', ['Statement','Question','Command','Exclamation']], ['BEG-06', ['Common noun','Proper noun','Concrete noun','Abstract noun','Collective noun']]]) {
  const titled = engine.beginnerSteps(lessons.find(item => item.id === id)).filter(step => step.kind === 'read' && step.card).map(step => step.title);
  for (const name of names) assert.ok(titled.includes(name), id + ' ' + name);
}

for (const lesson of lessons) {
  const steps = engine.beginnerSteps(lesson);
  assert.equal(new Set(steps.map(s=>s.id)).size,steps.length,lesson.id);
  const attempt = engine.emptyBeginnerAttempt(lesson);
  assert.equal(engine.readyToFinish(lesson,attempt),false);
  assert.equal(engine.firstUnfinished(lesson,attempt),0);
  attempt.videoRoute = lesson.video ? 'recap' : null;
  attempt.read = steps.filter(s=>s.kind==='read'||s.kind==='visual'||s.kind==='video').map(s=>s.id);
  if (!lesson.tasks.length) {
    assert.equal(engine.readyToFinish(lesson,attempt),true,lesson.id);
    continue;
  }
  for (const task of lesson.tasks) {
    assert.ok(task.explanation && task.prompt);
    if(task.kind==='choice') {
      assert.equal(task.options.length,3);
      assert.ok(task.options[task.answer]);
      assert.equal(new Set(task.options).size,3);
    }
    attempt.answers[task.id] = { value: task.kind==='choice' ? String(task.answer) : 'My own response.', submitted:true, reviewed:false, needsPractice:false, revision:'' };
  }
  assert.equal(engine.readyToFinish(lesson,attempt),true,'A checked answer unlocks Continue: '+lesson.id);
  const result = engine.beginnerResult(lesson,attempt);
  assert.equal(result.choiceCorrect,result.choiceTotal);
  assert.equal(result.choiceTotal,lesson.tasks.filter(t=>t.kind==='choice'&&t.phase==='quiz').length);
  assert.equal(result.reviewedResponses,lesson.tasks.filter(t=>t.kind==='response').length);
  attempt.stepId='summary'; attempt.finishedAt=1234;
  const roundTrip = engine.parseBeginnerAttempt(JSON.parse(JSON.stringify(attempt)),lesson);
  assert.equal(roundTrip.stepId,'summary');
  assert.equal(roundTrip.finishedAt,1234);
  assert.equal(engine.readyToFinish(lesson,roundTrip),true);
}

const lesson = lessons.find(item => item.id === 'BEG-01');
const attempt = engine.emptyBeginnerAttempt(lesson);
attempt.answers.G1={value:'Dev',submitted:true,reviewed:false,needsPractice:false,revision:'Dev gives help.'};
assert.equal(engine.saveBeginnerAttempt('learner-a',lesson,attempt),true);
assert.equal(engine.loadBeginnerAttempt('learner-a',lesson).answers.G1.value,'Dev');
assert.equal(engine.loadBeginnerAttempt('learner-b',lesson).answers.G1,undefined);
assert.equal(engine.loadBeginnerAttempt(null,lesson).answers.G1,undefined);
assert.equal(engine.parseBeginnerAttempt({...attempt,version:0},lesson).answers.G1,undefined);
assert.equal(engine.parseBeginnerAttempt({...attempt,stepId:'summary',finishedAt:900},lesson).stepId,engine.beginnerSteps(lesson)[0].id);
assert.equal(engine.parseBeginnerAttempt({...attempt,finishedAt:900},lesson).finishedAt,null);
const choice = lesson.tasks.find(t=>t.kind==='choice');
for(const invalid of ['-1','NaN','999','', '  ', '0.5']) {
  const dirty={...attempt,answers:{[choice.id]:{value:invalid,submitted:true,reviewed:true}}};
  const clean=engine.parseBeginnerAttempt(dirty,lesson);
  assert.equal(engine.taskDone(choice,clean.answers[choice.id]),false,invalid);
}
const open = lesson.tasks.find(t=>t.kind==='response');
const openDraft={...attempt,answers:{[open.id]:{value:'   ',submitted:true,reviewed:true}}};
assert.equal(engine.taskDone(open,engine.parseBeginnerAttempt(openDraft,lesson).answers[open.id]),false);
storage.set(engine.beginnerAttemptKey('broken',lesson.id),'{not json');
assert.equal(engine.loadBeginnerAttempt('broken',lesson).stepId,engine.beginnerSteps(lesson)[0].id);
blockedStorage=true;
assert.equal(engine.saveBeginnerAttempt('blocked',lesson,attempt),false);
assert.equal(engine.loadBeginnerAttempt('blocked',lesson).finishedAt,null);
blockedStorage=false;

let state=course.emptyGrammarState();
const first=course.lessonById('INTRO-01');
state=course.withCursor(state,'beginner','BEG-08');
assert.equal(course.cursorFor('beginner',state.levels.beginner),'BEG-08','Resume the selected lesson, not the first incomplete one.');
state=course.withReviewedCompletion(state,first,{choiceCorrect:0,choiceTotal:3,reviewedResponses:5,revisit:['Q1']},1234);
assert.equal(course.isLessonComplete(first,state.levels.beginner.log[first.id]),true);
assert.equal(state.levels.beginner.log[first.id].score,0,'Self-review must not invent a 100% grade.');
assert.equal(course.levelStats('beginner',state.levels.beginner).done,1);
course.saveGrammar('learner-a',state);
const restored=course.loadGrammar('learner-a');
assert.equal(course.isLessonComplete(first,restored.levels.beginner.log[first.id]),true);
assert.equal(course.levelStats('beginner',restored.levels.beginner).done,1);
const oldTopic=course.lessonById('BEG-01');
assert.equal(course.isLessonComplete(oldTopic,{score:100,completedAt:500}),false,'An old four-question quiz does not mark expanded writing content complete.');
for(const level of ['intermediate','advanced']) {
  const actual=course.lessonsFor(level);
  assert.equal(actual.length,45);
  for(const item of actual) assert.equal(JSON.stringify(item),JSON.stringify(original.GRAMMAR_LESSONS.find(l=>l.id===item.id)));
  assert.equal(course.isLessonComplete(actual[0],{score:75,completedAt:123}),true);
  assert.equal(course.isLessonComplete(actual[0],{score:50,completedAt:123}),false);
}
console.log('PASS: 41 activities, 287 explained tasks, reading-only openings, honest self-review scoring, full-course completion, resume, per-user drafts, malformed/versioned storage, legacy progress, and unchanged higher-level content.');

// Teaching stays on the topic cards. The separate diagram slide is not part of the path.
for (const item of lessons.filter(l => l.id.startsWith('BEG-'))) {
  const slides = engine.beginnerSteps(item);
  assert.equal(slides.some(s => s.kind === 'visual' || (s.kind === 'read' && s.title === 'See how it works')), false, item.id);
  assert.ok(!slides.some(s => s.title === 'What you will learn'), item.id);
  assert.ok(slides[0].goal, item.id);
}
const finalSteps = engine.beginnerSteps(lessons.find(l => l.id === 'FINAL-01'));
assert.ok(finalSteps.findIndex(s => s.id === 'writing-introduction') > finalSteps.findIndex(s => s.id === 'Q12'));
assert.equal(finalSteps[finalSteps.findIndex(s => s.id === 'W1') - 1].id, 'writing-introduction');
const review = lessons.find(l => l.id === 'REVIEW-03');
const video = engine.beginnerSteps(review).find(s => s.kind === 'video');
const videoAttempt = engine.emptyBeginnerAttempt(review);
videoAttempt.read = [video.id];
assert.equal(engine.stepDone(video,videoAttempt),false,'Read flag alone cannot bypass preparation');
for (const route of ['watched','recap']) {
  videoAttempt.videoRoute = route;
  assert.equal(engine.stepDone(video,videoAttempt),true);
  assert.equal(engine.parseBeginnerAttempt(videoAttempt,review).videoRoute,route);
}
assert.equal(engine.parseBeginnerAttempt({...videoAttempt,videoRoute:'fake'},review).videoRoute,null);
assert.equal(engine.parseBeginnerAttempt({...videoAttempt,version:1},review).read.length,0,'Changed content must not reuse positional slide IDs');
assert.equal(review.tasks.length,8);
assert.equal(lessons.find(l => l.id === 'REVIEW-05').tasks.length,8);
console.log('PASS: visual coverage, goal merging, writing order, preparation routes, version safety and expanded review coverage.');

const archiveId = engine.beginnerAttemptKey('archive-test', lesson.id);
const earlierDraft = JSON.stringify({version:1,answers:{Q5:{value:'2',submitted:true}},read:['read-0-0']});
storage.set(archiveId,earlierDraft);
assert.equal(engine.saveBeginnerAttempt('archive-test',lesson,engine.emptyBeginnerAttempt(lesson)),true);
assert.equal(storage.get(archiveId+':archive:v1'),earlierDraft,'Preserve old answers before replacing changed lesson drafts');
const oldState=course.emptyGrammarState();
oldState.levels.beginner.log[lesson.id]={score:66,completedAt:123,contentVersion:1,reviewed:true};
course.saveGrammar('history-test',oldState);
const history=course.loadGrammar('history-test');
assert.equal(history.levels.beginner.log[lesson.id].contentVersion,1);
assert.equal(course.isLessonComplete(course.lessonById(lesson.id),history.levels.beginner.log[lesson.id]),false);
console.log('PASS: archived earlier drafts and retained historical completion metadata.');
