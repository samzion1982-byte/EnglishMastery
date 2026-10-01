# Beginner grammar course

The Beginner category uses the manuscript in `notes/beginner/source`:

- Five short readings come before the levels. They have no practice, quiz, or writing.
- Level 1 is Foundations and starts at Parts of speech.
- 30 teaching lessons from BEG-01 to BEG-30, five mixed reviews, and a final practice.
- 287 guided, quiz, revision, and writing tasks, each with answer guidance.

Run `node scripts/build-beginner-course.cjs` after editing the manuscript. This generates `src/lib/beginner-catalog.ts`; do not edit that generated file directly. The generator excludes teacher/production notes, keeps answers separate from prompts, and checks complete syllabus coverage. `npm run test:beginner` also detects a stale generated catalog.

## Learning and completion

Named teaching cards explain one concept at a time. The learning goal appears on the first card. Every teaching topic has a labelled visual comparison or diagram, replacing repeated worked-example screens. The five opening readings remain reading-only. The revised course has 519 screens (including assessments), compared with 560 before the audit.

Multiple-choice answers use an answer key. Open responses require an attempt before showing a sample explanation; clicking Compare unlocks Continue without another checkbox. They are counted as submitted responses, not automatically graded correct answers. The final paragraph has a planning screen immediately before writing rather than before the quiz.

Beginner records are marked completed, not passed or mastered. Historical four-question quiz records remain stored, but do not count as completion of the expanded manuscript lessons. Previously rewarded topics do not receive a duplicate XP award. Intermediate and Advanced content and pass rules retain their existing behaviour.

Beginner completion awards XP without adding an invented correct answer to the overall activity statistics.

## Saved work

Course progress remains in the existing per-user browser store. Lesson attempts have separate per-user, per-lesson keys and save the current step, original answers, revisions, review flags, and completion time. Changing learners remounts the course. Storage failures show a message. Clearing browser data removes local progress; this change does not add cross-device server sync.

Increment `BEGINNER_CONTENT_VERSION` when changes invalidate previously saved steps or assessment meaning. Old completion logs are retained, while incompatible lesson drafts start fresh. The parser rejects malformed choices and cannot restore an unfinished attempt directly to completion.

## Infographics

Every BEG-01 to BEG-30 topic has a visual explanation. Six existing HTML/SVG diagram designs are retained for sentence parts, objects, quantities, ownership, comparisons and place. There are 27 new lesson-specific visual guides (including two opening readings and a time-preposition guide), with labelled word tiles and optional reveal explanations. Fragment and run-on visuals now teach their own distinct repair patterns.

The content is maintained in `notes/beginner/source/09-learning-media.json` and rendered by `beginner-visual-guide.tsx`. Labels do not rely on colour. Optional GPAI illustration briefs are in the completed audit document; no generated bitmap is required.

## Videos before level assessments

All five level reviews and final practice contain a Watch step before questions. Each resource names its publisher, links to a verified publisher page, states its limited topic coverage and includes a watching question. Khan Academy videos also have a YouTube embed. British Council resources open their publisher page. Publisher pages and available transcripts were checked; end-to-end video playback on every device was not verified.

Students choose watched or written recap when video access is unavailable. This self-report is saved and gates forward navigation; it is not evidence that playback or learning was measured. Recaps cover the level beyond the narrower video focus.

## Content revision and earlier work

Content version 2 avoids reusing positional slide IDs or changed question answers from version 1. Earlier completion records and XP remain; updated completion requires the revised material. Before a new attempt overwrites an incompatible browser draft, the original is preserved at the same key with `:archive:v1` appended. If archival fails, saving fails rather than silently replacing it. The archive is stored locally and has no learner-facing archive browser yet.

## Validation

`npm run test:beginner` checks catalog coverage, explained tasks, quiz validity, self-review completion, resume state, user separation, malformed and versioned storage, legacy progress, and preservation of higher-level content.

`node tests/beginner-preview/serve.cjs` provides an isolated localhost UI fixture on port 3131 with a synthetic learner. It uses the actual components and styles, without adding an app route or changing authentication. `--build-only` rebuilds its browser bundle after edits. It is not part of the deployed application.

Verification completed on 26 September 2026: production build and course tests passed. Browser checks covered a complete introduction lesson, wrong-answer feedback, required self-review, closing and resuming a written answer, completion and duplicate XP prevention, interactive sentence examples, and desktop and 390-pixel mobile layouts. Browser checks used the synthetic learner fixture, not a live account.

The content audit and source snapshots are in `notes/beginner/audit`. The Word audit has 16 rendered and visually checked pages. Browser checks for this revision used a synthetic learner and covered category entry, saved assessment preparation, the written recap path, question gating, an interactive explanation reveal and desktop/mobile layout. Production build and course tests pass.
