import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth-shell';
import { getSessionRole } from '@/lib/supabase-server';
import { ChangePasswordForm } from './change-password-form';

export const metadata = { title: 'Change password | English Mastery' };

export default async function ChangePasswordPage() {
  const { user } = await getSessionRole();
  if (!user) redirect('/login');
  return (
    <AuthShell title="Set a new password">
      <ChangePasswordForm />
    </AuthShell>
  );
}
