# GitHub and Vercel deployment

## Repository

Remote: https://github.com/samzion1982-byte/EnglishMastery
Keep this repository private. Real environment files, local archives, dependencies and generated builds are excluded by .gitignore.

## Vercel setup

1. Sign in to Vercel and select Add New > Project.
2. Connect GitHub and grant access to EnglishMastery, then import it.
3. Framework: Next.js. Root directory: repository root. Node.js: 24.x.
4. Build command: npm run build. Install command: npm ci. Leave output directory at the framework default.
5. Add the variables below using the values from your local .env.local. Do not paste secrets into chat or commit them.
6. Deploy. Copy the resulting HTTPS production URL.
7. In Supabase Authentication > URL Configuration, set Site URL to that production URL. Add the exact production password-reset URL ending in /reset-password to Redirect URLs. Keep local redirect entries if still developing locally.
8. Test login, password reset, admin navigation, translations, speaking submission and report downloads on the deployed URL.

## Environment variables

Required for database/authentication:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

For AI scoring and translation:
- GROQ_API_KEY
- AZURE_TRANSLATOR_KEY
- AZURE_TRANSLATOR_REGION

Optional model overrides (omit to use application defaults):
- GROQ_SPEAK_MODEL
- GROQ_GRAMMAR_MODEL
- GROQ_TRANSLATE_MODEL

Only the two NEXT_PUBLIC variables belong in the browser. Never use a Supabase service-role key as the anon key. Configure Production and, if wanted, Preview environments separately. Redeploy after environment changes.

## Existing database

Use the existing Supabase project to retain accounts and data. Deployment does not migrate the database or apply SQL. Do not blindly rerun existing migrations; check applied migrations first.

## Production compatibility

The build uses Webpack because Turbopack scans an inaccessible local QA directory on the current Windows checkout. Bulk school reports now download as one ZIP in the browser; individual reports remain XLSX downloads. The old local Desktop API is not used by the bulk export UI. Local companion functionality still requires the companion on the student's computer.

## References

- https://vercel.com/docs/deployments/git
- https://vercel.com/docs/environment-variables
- https://supabase.com/docs/guides/auth/redirect-urls


Individual accounts (2026-10-03): apply `supabase/migrations/20261003120000_individual_accounts.sql` after the existing migrations before deploying this UI. New individual licences create an account atomically; existing licences receive a key but need their learners created or assigned. Student is the default access level. Share the learner email, licence key and initial password 123456. Individual users sign in on the Individual tab with the Windows companion running, then change their password. Super Admin can reset a learner password or device in the licence editor. Apply `20261003130000_trustgate_password_recovery.sql` next: individual passwords created or changed through the app have an encrypted recovery copy that Super Admin can reveal, with an audit event. Existing custom passwords cannot be recovered until changed or reset. Copies are invalidated when the auth password hash changes outside the app. The encryption key is held in a restricted database schema; database owners can access it, so encryption does not protect against full database compromise.

Verify against a development Supabase instance: create a licence/account, check its auth identity and membership, sign in with its key and companion, change the password, reject a wrong key, reject a second computer, suspend the licence (including an individual with staff access), and reset password/device. The companion currently reports an unsigned device ID, so these development checks are not cryptographic device attestation. Closing the companion is detected by the browser guard within 30 seconds or on focus. SQL execution and these integrated checks require a connected Supabase instance.

Super Admin Settings now controls TrustGate for individual accounts globally (default ON). OFF still requires email/password, licence key and an active licence, but bypasses the companion and device binding. Switching ON invalidates individual activations so users must sign in with their registered computer again. School PIN/device authentication remains separate. Verify OFF login without the companion, ON login rejection without it, a non-Super-Admin settings write/password reveal rejection, password change and email recovery followed by Super Admin reveal, default-password recovery after reset, and external auth password changes invalidating the saved copy. These database checks remain unverified until migrations run against a development database.

Apply 20261003140000_trustgate_toggle_and_validity.sql to repair the TrustGate ON toggle under Supabase safe-update mode and expose the signed-in individual licence end date to account badges. Verify ON saves and invalidates individual activations, OFF still requires a key, and badges format dates as DD-MM-YYYY.
