import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { LoginForm } from './login-form';
import { LOGIN_PREFERENCE_KEY, loginIntent } from '@/lib/login-preference';


export default async function LoginIndex({
  searchParams,
}: {
  searchParams: Promise<{ as?: string; error?: string }>;
}) {
  const { as, error } = await searchParams;
  const stored = (await cookies()).get(LOGIN_PREFERENCE_KEY)?.value;
  const initialIntent = loginIntent(as) || loginIntent(stored) || 'school';
  return (
    <Suspense fallback={<p className="login-hint">Loading sign in…</p>}>
      <LoginForm initialIntent={initialIntent} initialError={error === 'licence' ? 'licence' : error === 'not-admin' ? 'not-admin' : ''} />
    </Suspense>
  );
}
