"use client";
import { useEffect, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase';

export function IndividualValidity() {
  const [validity, setValidity] = useState<string | null>(null);
  useEffect(() => {
    const client = createBrowserSupabase();
    let alive = true;
    async function load() {
      const { data, error } = await client.rpc('my_individual_validity');
      if (!alive) return;
      if (error || !data) { setValidity(null); return; }
      const date = typeof data.valid_until === 'string' ? data.valid_until.slice(0, 10) : null;
      setValidity(date ? date.split('-').reverse().join('-') : 'No fixed end');
    }
    void load();
    window.addEventListener('focus', load);
    return () => { alive = false; window.removeEventListener('focus', load); };
  }, []);
  return validity === null ? null : <small className="licence-validity">Licence Valid upto : {validity}</small>;
}
