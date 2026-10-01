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
