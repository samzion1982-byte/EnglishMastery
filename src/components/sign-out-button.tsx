'use client';

import { createBrowserSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Icon } from './icon';

export function SignOutButton({ className = 'quiet', icon = false, to = '/login' }: { className?: string; icon?: boolean; to?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        sessionStorage.removeItem('em-active-use');
        await createBrowserSupabase().auth.signOut();
        router.replace(to);
        router.refresh();
      }}
    >
      {icon && <Icon kind="logout" />}
      Sign out
    </button>
  );
}
