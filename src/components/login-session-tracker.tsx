'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase';

/** Tracks authenticated workspace visits; refreshes and extra tabs share the auth session. */
export function LoginSessionTracker() {
  const path = usePathname();
  useEffect(() => {
    if (/^\/(login|change-password|reset-password|join|j)(\/|$)/.test(path)) return;
    const supabase = createBrowserSupabase();
    let disposed = false;
    let pending = false;
    async function touch() {
      if (disposed || pending) return;
      pending = true;
      try {
        const { data } = await supabase.auth.getSession();
        if (!disposed && data.session) await supabase.rpc('touch_login_session', { p_user_agent: navigator.userAgent });
      } catch {
        // A temporary connection failure must not interrupt the user. The next heartbeat retries.
      } finally { pending = false; }
    }
    void touch();
    const timer = window.setInterval(() => void touch(), 30000);
    const onFocus = () => void touch();
    window.addEventListener('focus', onFocus);
    return () => { disposed = true; window.clearInterval(timer); window.removeEventListener('focus', onFocus); };
  }, [path]);
  return null;
}
