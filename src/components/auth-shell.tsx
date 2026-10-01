import Image from 'next/image';
import { Logo } from './logo';

export function AuthShell({
  kicker = 'English Mastery',
  title = 'Sign in',
  children,
}: {
  kicker?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <aside className="auth-hero">
        <div className="auth-brand">
          <Logo size={56} />
          <div>
            <h1>English Mastery</h1>
            <p className="auth-tagline">Structured English for teenagers.</p>
          </div>
        </div>
        <figure className="auth-visual">
          <Image
            src="/images/login-classroom.jpg"
            alt="A shy student finds her words, practices at a laptop, and becomes a confident speaker presenting to the class"
            fill
            preload
            sizes="60vw"
          />
        </figure>
      </aside>
      <main className="auth-panel">
        <p className="auth-kicker">{kicker}</p>
        <h2>{title}</h2>
        {children}
      </main>
    </div>
  );
}
