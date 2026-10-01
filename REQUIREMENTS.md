# English Mastery — requirements and decisions

## Latest visual decision — 2026-09-23

User rejected the dashboard layout, graphics and lack of excitement, selected a vibrant illustrated world, and authorized implementation. Replace the sidebar/card dashboard with Discovery Town and compact top navigation. Use custom SVG artwork, warm cream, coral, turquoise, yellow and deep green ink. Vocabulary is Word Street; future destinations are Story Studio, Expression Square and The Stage. The polished 2D approach is an implementation choice made after authorization, not an explicit preference over 3D. Learning behaviour and local preview boundaries remain unchanged.

Source: Codex task **Build vocabulary learning PWA**, `01a0ca10-1c88-7db0-b90f-660cfa4ac31d`, local. All available turns retrieved on 2026-09-23, including the original attached PRD. Later user decisions take precedence; assistant recommendations are not approvals.

## Confirmed direction

- Complete English learning platform named English Mastery, primarily ages 12–17. Vocabulary first; later grammar, idioms and phrases, communication videos and other English skills.
- Impressive gaming-style student experience, custom graphics and SVG icons, no emoji icons or corporate dashboard aesthetic. Responsive desktop, laptop, tablet and smartphone layouts.
- Next.js + TypeScript + Supabase. Local development in C:\Projects\EnglishMastery; no deployment now. Hosted Supabase development project already configured.
- Ask mother tongue at signup and show translated word meanings. Facilitate ongoing vocabulary additions.
- Individual and group licences; Sam is Super Admin. Retain CMS-style device requests, approval and emergency Super Admin access.
- Windows access first using the existing installed TrustGate companion. Separate Android companion later. Responsive layouts do not imply approved access on every OS.
- Preserve .env.local, .env.example and .gitignore exactly. Do not alter CMS or companion projects.
- Dedicated SSH connection, separate from WMS. Source conversation path is C:\Users\Sam\.ssh\EnglishMastery\id_ed25519; latest handoff spells C:\Users\Sam.ssh\EnglishMastery\id_ed25519. Verify path before any future Git connection; no key needed for this local milestone.

## Original vocabulary specification retained, with unresolved conflicts

- Intermediate/Advanced pools, 90/10 weighting; Basic and appendix categories excluded for now.
- Append-only 100-word batches within difficulty pools, permanent entry ordering, incomplete batches pending. Published membership immutable.
- Learn: pronunciation, synonyms/antonyms, two examples, own-sentence grammar and contextual feedback.
- Practice: at least three presentations per word with distinct plausible distractors; unlimited repeats and mistake-only practice.
- Test: full active batch, reshuffled retakes, stored score/time/date, pass unlocks next batch. Threshold unresolved (95% versus 100%).
- Word-level progress as source of truth, live denominators, preserved historical achievements. Original removal rules and pending-word denominators conflict; do not silently choose production semantics.
- Student, parent, teacher and school administration; linked-student access, rosters, assignments, reporting and exports.
- Discrete study sessions; separate inactivity, study inactivity and missed-target alerts. Alert recipients, escalation details and thresholds need confirmation.
- PWA and offline learning ambitions retained, subject to Windows access and bounded offline licensing design.

## Proposed defaults, NOT confirmed requirements

95% configurable pass mark; seven-day demo and AI caps; two devices and one concurrent session; both personal and teacher goals; three-day configurable alerts; published-active-only progress denominator; retirement excluded from both numerator and denominator; versioned content; practice mastery thresholds; review algorithm; light theme; exact colour palette; language catalogue; pricing, consent geography and notification delivery providers.

Spaced Review was recommended in the original specification and refinement, not separately approved. A local preview can demonstrate it without establishing commercial grading or retention rules.

## TrustGate reference findings

Read-only source inspection: D:\My Projects\WMS backup\WMS\WMS\authenticator\main.js and C:\Projects\Church-CMS-React\src\lib\companion.js. CMS queries http://127.0.0.1:65432/status with localhost fallback and 3.5-second timeout. Companion returns running and deviceId (stored UUID), plus bypass metadata. This is an identifier, not signed hardware proof. English Mastery must not trust bypassActive as authorization or inherit CMS approval.

Proposed secure implementation: authenticated server-side device/licence checks, tenant-scoped RLS, time-limited audited Super Admin recovery. These are implementation safeguards, not permission to seed a Super Admin from user-editable signup metadata. Recovery must not grant student licences.

## Initial implementation milestone

Build a local, explicitly labelled sample preview: responsive learning hub, vocabulary lesson/practice, mother-tongue preference, local progress and TrustGate diagnostic. Add Supabase client foundation without modifying the remote database. This is not licensed production access. Signup, server-side approval/licensing, emergency recovery, CMS/import, official tests, AI feedback, reporting, offline synchronization and Android remain subsequent work.

Technical references: https://nextjs.org/docs/app/getting-started/installation and https://supabase.com/docs/reference/javascript/initializing.
