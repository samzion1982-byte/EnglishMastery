import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { LoginForm } from './login-form';

function rememberedIntent(value: string | undefined) {
  if (value === 'admin' || value === 'individual' || value === 'school') return value;
  return 'school' as const;
}

export default async function LoginIndex({
  searchParams,
}: {
  searchParams: Promise<{ as?: string; error?: string }>;
}) {
  const { as, error } = await searchParams;
  const stored = (await cookies()).get('em-login-as')?.value;
  const initialIntent = as === 'admin' || as === 'individual' || as === 'school' ? as : rememberedIntent(stored);
  return (
    <Suspense fallback={<p className="login-hint">Loading sign in…</p>}>
      <LoginForm initialIntent={initialIntent} initialError={error === 'licence' ? 'licence' : error === 'not-admin' ? 'not-admin' : ''} />
    </Suspense>
  );
}
