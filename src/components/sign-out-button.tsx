'use client';

import { createBrowserSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Icon } from './icon';

export function SignOutButton({ className = 'quiet', icon = false, iconOnly = false, to = '/login' }: { className?: string; icon?: boolean; iconOnly?: boolean; to?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      aria-label={iconOnly ? 'Sign out' : undefined}
      title={iconOnly ? 'Sign out' : undefined}
      onClick={async () => {
        sessionStorage.removeItem('em-active-use');
        await createBrowserSupabase().auth.signOut();
        router.replace(to);
        router.refresh();
      }}
    >
      {(icon || iconOnly) && <Icon kind="logout" />}
      {!iconOnly && 'Sign out'}
    </button>
  );
}
