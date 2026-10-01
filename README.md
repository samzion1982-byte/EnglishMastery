# English Mastery

English learning platform built with Next.js App Router, React and Supabase. Includes vocabulary practice, listening and speaking activities, learning progress, and administration for schools, licences and reports. Speaking recordings are scored through Groq; translation uses Azure and configured fallbacks.

## Local development

Use Node.js 24. Copy .env.example to .env.local and supply your own configuration.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Never commit .env.local or API keys.

## Validation

```sh
npm run typecheck
npm run build
npm run test:speaking
npm run test:speech
node tests/admin-session.cjs
node tests/admin-lazy-workbooks.cjs
```

## Deployment

See [deployment instructions](docs/DEPLOYMENT.md) for GitHub, Vercel environment variables and Supabase redirect configuration. SQL migrations are maintained under supabase/migrations; application deployment does not apply them automatically.
