# Local preview verification — 2026-09-23

## Discovery Town redesign verification

- Production build and TypeScript passed after the redesign and final refinements.
- Inspected the new desktop composition at 1366px, translated lesson at 390px, and home/map at 320px.
- At 320px, all four destination labels fit inside the screen; document scroll width equals client width (306px after scrollbar).
- Word Street opens the first unexplored word (Collaborate for the existing three-word preview progress).
- Tamil meanings remain visible; correct practice answers show confirmation and lock the answer controls.
- Switching sections resets scroll position to the top.
- No warnings/errors in the inspected browser console.
- Rechecked all three protected files: unchanged. No deployment or backend changes.

## Passed

- Production build including TypeScript, page generation and optimization. Repeated after responsive fix.
- Standalone `npm run typecheck`.
- HTTP 200 from http://127.0.0.1:3000.
- Browser: basecamp to vocabulary lesson, next-word progression, Tamil and Hindi sample meanings.
- Practice: deliberate wrong answer displays correction and disables further answers; four subsequent correct answers produce the expected 4/5 result.
- Retry resets the question and changes answer positions.
- Name, language and explored-word count persist after reload and hydration.
- Existing TrustGate companion is detected from the browser.
- Desktop, 768px tablet, 390px phone and 320px narrow-phone checks. Found navigation overflow at 320px, fixed by stacking icon/label and allowing flexible navigation widths; rebuilt and verified scroll width equals client width (306px after scrollbar).
- No warnings or errors in the inspected browser console.
- SHA-256 checks confirm .env.local, .env.example and .gitignore remain byte-for-byte unchanged from the initial inspection.
- Dependency installation audit reported zero vulnerabilities.

## Limits

This verifies the initial sample preview, not the full requirements. Supabase client foundation is present but authentication/database operations are not wired to the UI. Production licensing, device approval, Super Admin recovery, AI, full curriculum tests, imports/reporting and offline PWA behavior are not implemented or tested. Pronunciation audio quality and assistive-technology compatibility were not manually verified. Responsive checks use browser viewport overrides, not physical devices.

The sandbox rejected Next.js worker process spawning with EPERM. Build and local server succeeded through the approved execution route. Nothing was deployed and no remote database was changed.
