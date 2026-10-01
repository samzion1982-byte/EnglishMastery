'use client';

import { useEffect, useState } from 'react';
import { Logo } from '@/components/logo';
import { readCompanion } from '@/lib/companion';
import { MOTHER_TONGUES } from '@/lib/languages';
import { createBrowserSupabase } from '@/lib/supabase';

type Info = { ok?: boolean; name?: string; open?: boolean; reason?: string; starts?: string };

function closedMessage(info: Info, school: string) {
  if (info.reason === 'not_started') return `${school} starts accepting registrations on ${String(info.starts).slice(0, 10)}.`;
  if (info.reason === 'suspended') return `${school} is suspended. Ask English Mastery to open registrations.`;
  if (info.reason === 'blocked') return `${school} is not taking new computers right now.`;
  if (info.reason === 'ended') return `The licence for ${school} has ended.`;
  return `${school} is not accepting registrations right now. Ask English Mastery to open registrations.`;
}
type Result = { reason?: string; outcome?: string; name?: string; class_label?: string; school?: string; detail?: string };
type Gate = 'checking' | 'windows-missing' | 'other-os' | 'ready';

function computerKind() {
  const agent = navigator.userAgent;
  if (/Android/i.test(agent)) return 'android';
  if (/Windows/i.test(agent)) return 'windows';
  return 'other';
}

export function JoinForm({ code, info }: { code: string; info: Info | null }) {
  const [admission, setAdmission] = useState('');
  const [language, setLanguage] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [gate, setGate] = useState<Gate>('checking');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const school = info?.ok ? info.name : '';
  const open = !!info?.open;

  async function lookForAuthenticator() {
    setGate('checking');
    setError('');
    const kind = computerKind();
    if (kind !== 'windows') {
      setGate('other-os');
      setDeviceId('');
      return;
    }
    const companion = await readCompanion();
    if (!companion.ok) {
      setGate('windows-missing');
      setDeviceId('');
      return;
    }
    setDeviceId(companion.deviceId);
    setGate('ready');
  }

  useEffect(() => {
    void lookForAuthenticator();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!deviceId) return;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const supabase = createBrowserSupabase();
      const { data, error: rpcError } = await supabase.rpc('join_school', {
        p_code: code,
        p_admission: admission,
        p_device: deviceId,
        p_language: language,
      });
      if (rpcError) throw rpcError;
      const body = (data || {}) as Result & { ok?: boolean };
      if (!body.ok && body.reason === 'inactive') {
        setError('This admission number is disabled. Ask the school office.');
        return;
      }
      if (!body.ok && body.reason === 'email_collision') {
        setError('This admission number would share a sign-in with another student. Ask English Mastery to check the school id and the admission number.');
        return;
      }
      if (!body.ok && body.reason === 'account') {
        setError(body.detail
          ? `Registration could not create the student sign-in. ${body.detail}`
          : 'Registration could not create the student sign-in. Try again in a moment.');
        return;
      }
      if (!body.ok && body.reason === 'unknown_student') {
        setError(`${school || 'This school'} does not have that admission number yet. Ask the school office to send it in.`);
        return;
      }
      if (!body.ok && body.reason === 'closed') {
        setError(`${body.school || 'This school'} is not accepting registrations right now.`);
        return;
      }
      if (!body.ok && body.reason === 'language') {
        setError('Choose your mother tongue.');
        return;
      }
      if (!body.ok && body.reason === 'no_device') {
        setGate('windows-missing');
        setDeviceId('');
        return;
      }
      if (!body.ok) {
        setError('This link is not active. Ask your school for the current link.');
        return;
      }
      setResult(body);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err ? String(err.message) : '';
      setError(message
        ? `Registration could not be sent. ${message}`
        : 'Registration could not be sent. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="join-page">
      <form className="join-card" onSubmit={submit}>
        <Logo size={40} />
        <p className="join-kicker">English Mastery</p>
        <h1>{school || 'School registration'}</h1>
        {!info?.ok && <p>This link is not active. Ask your school for the current link.</p>}
        {info?.ok && !open && <p>{closedMessage(info, school || 'This school')} The authenticator on this computer is checked after registrations are open.</p>}
        {info?.ok && open && gate === 'checking' && <p role="status">Looking for the authenticator on this computer…</p>}
        {info?.ok && open && gate === 'other-os' && (
          <p>Open this link on a Windows computer that has the English Mastery authenticator installed and running. The Android authenticator is not available yet.</p>
        )}
        {info?.ok && open && gate === 'windows-missing' && (
          <>
            <p>Install the English Mastery authenticator for Windows and open it on this computer. You can enter your admission number after it is running.</p>
            <button type="button" className="go" onClick={() => void lookForAuthenticator()}>Check again</button>
          </>
        )}
        {result?.reason === 'pending' && (
          <p className="join-result" role="status">{result.name} ({result.class_label}) is waiting for approval on this computer. After approval, open English Mastery and enter PIN 123456. You can change your mother tongue later in Profile.</p>
        )}
        {result?.reason === 'approved' && (
          <>
            <p className="join-result" role="status">{result.name} is approved for {result.class_label}. Open English Mastery on this computer and enter PIN 123456.</p>
            <a className="go" href="/login?as=school">Open English Mastery</a>
          </>
        )}
        {result?.reason === 'second_device' && result.outcome === 'approved' && (
          <>
            <p className="join-result" role="status">{result.name} is approved for {result.class_label}. Open English Mastery on this computer and enter PIN 123456.</p>
            <a className="go" href="/login?as=school">Open English Mastery</a>
          </>
        )}
        {result?.reason === 'second_device' && result.outcome !== 'rejected' && result.outcome !== 'approved' && (
          <p className="join-result" role="status">This admission number already has a device. This computer is waiting. A parent can contact English Mastery to ask for a second device.</p>
        )}
        {result?.reason === 'second_device' && result.outcome === 'rejected' && (
          <p className="notice error" role="alert">This admission number already has a device. A second device was not approved.</p>
        )}
        {result?.reason === 'rejected' && <p className="notice error" role="alert">This registration was not approved. Ask your school to check the admission number.</p>}
        {error && <p className="notice error" role="alert">{error}</p>}
        {info?.ok && open && gate === 'ready' && !result && (
          <>
            <label>
              Admission number
              <input required autoComplete="off" value={admission} onChange={(event) => setAdmission(event.target.value)} placeholder="2019-0001" />
            </label>
            <label>
              Mother tongue
              <select required value={language} onChange={(event) => setLanguage(event.target.value)}>
                <option value="" disabled>Choose your mother tongue</option>
                {MOTHER_TONGUES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
            <button className="go" type="submit" disabled={busy || !deviceId}>{busy ? 'Sending…' : 'Submit'}</button>
            <p className="join-note">Meanings will be shown in the language you choose. You can change it later in Profile.</p>
          </>
        )}
      </form>
    </main>
  );
}
