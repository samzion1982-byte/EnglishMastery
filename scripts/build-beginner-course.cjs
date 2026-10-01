// Keep the app's student content aligned with the reviewed manuscript.
// Run: node scripts/build-beginner-course.cjs [--check]
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'notes/beginner/source');
const lessons = [];
let lesson, section, question;
for (const file of fs.readdirSync(source).filter(f => /^0[1-7]-.*\.md$/.test(f)).sort()) {
  for (const line of fs.readFileSync(path.join(source, file), 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('# ')) continue;
    if (line.startsWith('## ')) {
      const [, id, title] = line.match(/^## (\S+) (.+)$/);
      lesson = { id, title, kind: id.startsWith('REVIEW') ? 'review' : id.startsWith('FINAL') ? 'capstone' : 'concept', sections: [], tasks: [] };
      lessons.push(lesson);
      section = null;
    } else if (line.startsWith('### ')) {
      section = { title: line.slice(4), paragraphs: [], examples: [] };
      lesson.sections.push(section);
    } else if (line.startsWith('? ')) {
      const [, id, text] = line.match(/^\? ([GQW]\d+)\. (.+)$/);
      const parts = text.split(/ (?=[ABC]\) )/);
      question = { id, phase: id[0] === 'G' ? 'guided' : id[0] === 'W' ? 'write' : 'quiz', kind: parts.length === 4 ? 'choice' : 'response', prompt: parts[0], explanation: '' };
      if (question.kind === 'choice') question.options = parts.slice(1).map(p => p.slice(3));
      lesson.tasks.push(question);
    } else if (line.startsWith('= ')) {
      assert(question);
      const answer = line.slice(2).replace(/\bAccept /g, 'You can use ').replace(/Do not require the sample wording\./g, 'Your wording can be different.').replace(/Do not require the sample length or wording beyond the five-to-seven-sentence instruction\./g, 'Write five to seven sentences in your own words.');
      if (question.kind === 'choice') {
        assert.match(answer, /^[ABC]\. /, lesson.id + ' ' + question.id);
        question.answer = answer.charCodeAt(0) - 65;
        question.explanation = answer.slice(3);
      } else question.explanation = answer;
    } else {
      assert(section, line);
      (line.startsWith('- ') ? section.examples : section.paragraphs).push(line.startsWith('- ') ? line.slice(2) : line);
    }
  }
}
const diagramIds = { 'INTRO-03':'sentence', 'BEG-03':'sentence', 'BEG-04':'object', 'BEG-08':'amount', 'BEG-09':'ownership', 'BEG-18':'comparison', 'BEG-24':'place', 'BEG-27':'repair', 'BEG-28':'repair' };
const media = JSON.parse(fs.readFileSync(path.join(source, '09-learning-media.json'), 'utf8'));
const videos = media.videos;
for (const lesson of lessons) {
  if (diagramIds[lesson.id]) lesson.visual = diagramIds[lesson.id];
  if (videos[lesson.id]) lesson.video = videos[lesson.id];
  if (media.guides[lesson.id]) lesson.visualGuide = media.guides[lesson.id];
  if (['BEG-27', 'BEG-28'].includes(lesson.id)) delete lesson.visual;
  if (lesson.id.startsWith('INTRO')) lesson.tasks = [];
  lesson.sections = lesson.sections.filter(s => s.paragraphs.length || s.examples.length);
  assert(lesson.sections.length > 0);
  assert(lesson.tasks.every(t => t.explanation && t.prompt));
  assert.equal(new Set(lesson.tasks.map(t => t.id)).size, lesson.tasks.length);
}
const ids = (a, b) => Array.from({ length: b-a+1 }, (_, i) => `BEG-${String(a+i).padStart(2,'0')}`);
const units = [
  { number:0, title:'Before you begin', lessonIds:['INTRO-04','INTRO-05','INTRO-01','INTRO-02','INTRO-03'] },
  { number:1, title:'Foundations', lessonIds:[...ids(1,5),'REVIEW-02'] },
  { number:2, title:'Nouns and pronouns', lessonIds:[...ids(6,12),'REVIEW-03'] },
  { number:3, title:'Basic verbs', lessonIds:[...ids(13,16),'REVIEW-04'] },
  { number:4, title:'Describing words and noun helpers', lessonIds:[...ids(17,24),'REVIEW-05'] },
  { number:5, title:'Writing accuracy', lessonIds:[...ids(25,30),'REVIEW-06','FINAL-01'] },
];
const taught = lessons.filter(lesson => lesson.id !== 'REVIEW-01');
assert.equal(taught.length, 41);
assert.equal(taught.reduce((n,l)=>n+l.tasks.length,0), 287);
assert.deepEqual(new Set(units.flatMap(u=>u.lessonIds)),new Set(taught.map(l=>l.id)));
const output = '// Generated from notes/beginner/source by scripts/build-beginner-course.cjs.\n' +
  "import type { BeginnerLesson } from './beginner-types';\n\n" +
  'export const BEGINNER_LESSONS: BeginnerLesson[] = ' + JSON.stringify(taught,null,2) + ';\n\n' +
  'export const BEGINNER_UNITS = ' + JSON.stringify(units,null,2) + ';\n';
const destination = path.join(root,'src/lib/beginner-catalog.ts');
if (process.argv.includes('--check')) assert.equal(fs.readFileSync(destination,'utf8'),output,'Run the generator to update manuscript content.');
else fs.writeFileSync(destination,output);
console.log(`Beginner content ${process.argv.includes('--check')?'verified':'generated'}: 5 readings, 30 lessons, 5 reviews, final practice, 287 tasks.`);
