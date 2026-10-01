import { AuthShell } from '@/components/auth-shell';

export const metadata = { title: 'Sign in | English Mastery' };

export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthShell title="Sign in">{children}</AuthShell>;
}
