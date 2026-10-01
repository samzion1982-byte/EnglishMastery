import { AuthShell } from '@/components/auth-shell';
import { ResetPasswordForm } from './reset-password-form';

export const metadata = { title: 'Reset password | English Mastery' };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Reset password">
      <ResetPasswordForm />
    </AuthShell>
  );
}
