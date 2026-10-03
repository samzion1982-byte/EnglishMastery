"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase';
import { readCompanion } from '@/lib/companion';

// The development companion reports a device ID; this is not signed attestation.
export function IndividualCompanionGuard() {
  const path = usePathname();
  useEffect(() => {
    if (path === '/login' || path === '/reset-password' || path.startsWith('/j/') || path.startsWith('/join/')) return;
    const client = createBrowserSupabase();
    let stopped = false;
    let checking = false;
    async function check() {
      if (checking || stopped) return;
      checking = true;
      try {
        const { data } = await client.auth.getSession();
        if (!data.session) return;
        const gate = await client.rpc('individual_sign_in_gate');
        if (gate.data?.kind !== 'individual') return;
        const policy = await client.rpc('trustgate_required');
        if (!policy.error && policy.data === false && gate.data.ok) return;
        const companion = await readCompanion();
        if (stopped) return;
        if (!gate.error && gate.data.ok && companion.ok) {
          const verified = await client.rpc('verify_individual_device', { p_device: companion.deviceId });
          if (!verified.error && verified.data === true) return;
        }
        await client.auth.signOut();
        if (!stopped) window.location.assign('/login?as=individual');
      } finally { checking = false; }
    }
    void check();
    const timer = window.setInterval(() => void check(), 30000);
    const focus = () => void check();
    window.addEventListener('focus', focus);
    return () => { stopped = true; window.clearInterval(timer); window.removeEventListener('focus', focus); };
  }, [path]);
  return null;
}
