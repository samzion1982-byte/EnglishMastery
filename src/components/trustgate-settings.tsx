"use client";
import { useEffect, useMemo, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase';
export function TrustGateSettings() {
  const client = useMemo(() => createBrowserSupabase(), []);
  const [required, setRequired] = useState(true);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  useEffect(() => { let alive = true; client.rpc('trustgate_required').then(({ data, error }) => {
    if (!alive) return;
    if (error || typeof data !== 'boolean') setMessage('Apply the TrustGate settings migration, then reload.');
    else { setRequired(data); setBusy(false); }
  }); return () => { alive = false; }; }, [client]);
  async function save(value: boolean) {
    setBusy(true); setMessage('');
    const { error } = await client.rpc('set_trustgate_required', { p_required: value });
    if (error) setMessage(error.message);
    else { setRequired(value); setMessage('TrustGate setting saved for all individual accounts.'); }
    setBusy(false);
  }
  return <section id="trustgate" className="settings-panel">
    <h2>TrustGate</h2>
    <p>When enabled, individual users must run the Windows companion app on their registered computer. Turning it on requires users to sign in again. School PIN authentication keeps its existing device checks.</p>
    <label><input type="checkbox" checked={required} disabled={busy} onChange={(event) => void save(event.target.checked)} /> Require TrustGate at individual login</label>
    <p>Gate is {required ? 'ON — companion and registered computer required.' : 'OFF — email, password and licence key login.'}</p>
    <p role="status">{message}</p>
  </section>;
}
