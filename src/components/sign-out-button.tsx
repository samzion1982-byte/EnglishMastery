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
        const supabase = createBrowserSupabase();
        try {
          await supabase.rpc('touch_login_session', { p_end: true });
        } catch {
          // Sign out even if logging is unavailable.
        }
        await supabase.auth.signOut();
        router.replace(to);
        router.refresh();
      }}
    >
      {(icon || iconOnly) && <Icon kind="logout" />}
      {!iconOnly && 'Sign out'}
    </button>
  );
}
