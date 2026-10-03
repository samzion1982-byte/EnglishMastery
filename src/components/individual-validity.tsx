"use client";
import { useEffect, useState } from 'react';

export function IndividualValidity() {
  const [validity, setValidity] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const response = await fetch('/api/individual/validity', { cache: 'no-store' });
        const data = await response.json();
        if (!alive) return;
        if (!data.individual) { setValidity(null); return; }
        const date = response.ok && typeof data.valid_until === 'string' ? data.valid_until.slice(0, 10) : null;
        setValidity(date ? date.split('-').reverse().join('-') : 'Unavailable');
      } catch { if (alive) setValidity(null); }
    }
    void load();
    window.addEventListener('focus', load);
    return () => { alive = false; window.removeEventListener('focus', load); };
  }, []);
  return validity === null ? null : <small className="licence-validity">Licence Valid upto : {validity}</small>;
}
