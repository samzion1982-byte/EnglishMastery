'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase';
import { STUDENT_DEFAULT_PASSWORD, isAdminStaff, isSchoolStaff } from '@/lib/access';
import { readCompanion } from '@/lib/companion';

import { loginIntent, readLoginPreference, rememberLoginPreference, type LoginIntent as Intent } from '@/lib/login-preference';

function concealTemporaryPassword(form: HTMLFormElement) {
  form.querySelectorAll<HTMLInputElement>('[data-password-field]').forEach((field) => {
    field.value = '';
    field.setAttribute('autocomplete', 'off');
    field.setAttribute('type', 'text');
  });
}

export function LoginForm({ initialIntent = 'school', initialError = '' }: { initialIntent?: Intent; initialError?: '' | 'not-admin' | 'licence' }) {
  const params = useSearchParams();
  const [intent, setIntent] = useState<Intent>(initialIntent);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(initialError === 'licence' ? 'This individual licence is not active.' : initialError === 'not-admin' ? 'This account does not have admin access.' : '');
  const [resetNote, setResetNote] = useState('');
  const supabase = useMemo(() => createBrowserSupabase(), []);

  useEffect(() => {
    const preferred = loginIntent(params.get('as')) || readLoginPreference() || initialIntent;
    setIntent(preferred);
    if (params.get('error') === 'not-admin') setMessage('This account does not have admin access.');
    if (params.get('error') === 'licence') setMessage('This individual licence is not active.');
  }, [params, initialIntent]);


  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const enteredPassword = password;
    const temporary = intent !== 'school' && enteredPassword === STUDENT_DEFAULT_PASSWORD;
    if (temporary) {
      concealTemporaryPassword(form);
      setPassword('');
    }
    setBusy(true);
    setMessage('');
    setResetNote('');
    let leaving = false;
    try {
      let signEmail = email;
      let signPassword = enteredPassword;
      if (intent === 'school') {
        if (pin !== STUDENT_DEFAULT_PASSWORD) {
          setMessage('Enter PIN 123456.');
          return;
        }
        const kind = /Android/i.test(navigator.userAgent) ? 'android' : /Windows/i.test(navigator.userAgent) ? 'windows' : 'other';
        if (kind !== 'windows') {
          setMessage('Open English Mastery on the Windows computer where the authenticator is installed.');
          return;
        }
        const companion = await readCompanion();
        if (!companion.ok) {
          setMessage('Open the English Mastery authenticator on this computer, then try again.');
          return;
        }
        const { data: gate, error: gateError } = await supabase.rpc('student_pin_login', { p_device: companion.deviceId, p_pin: pin });
        if (gateError) throw gateError;
        const body = (gate || {}) as { ok?: boolean; reason?: string; email?: string };
        if (!body.ok || !body.email) {
          const reason = body.reason;
          setMessage(reason === 'pending'
            ? 'This computer is waiting for approval.'
            : reason === 'second_device'
              ? 'This computer is waiting for a second device to be allowed.'
              : reason === 'inactive'
                ? 'This student is disabled. Ask the school office.'
              : reason === 'closed'
                ? 'This school licence is not active.'
              : reason === 'pin'
                ? 'Enter PIN 123456.'
                : 'This computer is not registered. Use the link from your school first.');
          return;
        }
        signEmail = body.email;
        signPassword = STUDENT_DEFAULT_PASSWORD;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email: signEmail, password: signPassword });
      if (error) throw error;
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_active, must_change_password')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profileError) throw new Error('Could not read your profile. Ask Super Admin to finish setup.');
      if (profile?.is_active === false) {
        await supabase.auth.signOut();
        setMessage('This account is inactive. Ask Super Admin to activate it.');
        return;
      }
      const role = profile?.role || 'student';
      if (intent === 'admin' && !isAdminStaff(role) && !isSchoolStaff(role)) {
        await supabase.auth.signOut();
        setMessage('This account does not have admin access.');
        return;
      }
      if (intent === 'individual' && isAdminStaff(role)) {
        await supabase.auth.signOut();
        setMessage('This sign-in is for an individual student.');
        return;
      }
      if (intent === 'individual' && role === 'student') {
        const gate = await supabase.rpc('individual_sign_in_gate');
        const body = gate.data && typeof gate.data === 'object' ? gate.data as { ok?: boolean; reason?: string; kind?: string } : null;
        if (!gate.error && body && (body.kind === 'school' || body.ok === false)) {
          await supabase.auth.signOut();
          setMessage(body.kind === 'school'
            ? 'This sign-in is for an individual student.'
            : body.reason === 'closed'
              ? 'This individual licence is not active.'
              : 'This account is not on an individual licence.');
          return;
        }
      }
      rememberLoginPreference(isAdminStaff(role) || isSchoolStaff(role) ? 'admin' : intent);
      leaving = true;
      if (temporary) concealTemporaryPassword(form);
      window.location.assign(profile?.must_change_password
        ? '/change-password'
        : isAdminStaff(role) || isSchoolStaff(role) ? '/admin/overview' : '/');
      return;
    } catch (err) {
      const text = err instanceof Error ? err.message : err && typeof err === 'object' && 'message' in err ? String(err.message) : '';
      setMessage(/student_pin_login|schema cache|does not exist/i.test(text)
        ? 'Sign in is not ready yet. Register from your school link and wait for approval.'
        : /is not a function|TURBOPACK/i.test(text) || !text
          ? 'Sign in could not start. Reload this page and try again.'
          : text);
    } finally {
      if (!leaving) {
        if (temporary) setPassword(enteredPassword);
        setBusy(false);
      }
    }
  }

  async function forgotPassword() {
    const address = email.trim();
    if (!address) {
      setResetNote('');
      setMessage('Enter your email, then choose Forgot password.');
      return;
    }
    setBusy(true);
    setMessage('');
    setResetNote('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(address, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        if (/rate limit/i.test(error.message)) {
          setMessage('A reset email was sent recently. Wait a few minutes, or ask Super Admin to reset the password from the staff list.');
          return;
        }
        throw error;
      }
      setResetNote('If that email is a staff account, a reset link is on its way. You can also ask Super Admin to reset it.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not send the reset email.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-card">
      {intent !== 'admin' && (
        <div className="seg" role="tablist" aria-label="Sign in as">
          <button type="button" role="tab" aria-selected={intent === 'school'} className={intent === 'school' ? 'on' : undefined} onClick={() => setIntent('school')}>
            School
          </button>
          <button type="button" role="tab" aria-selected={intent === 'individual'} className={intent === 'individual' ? 'on' : undefined} onClick={() => setIntent('individual')}>
            Individual
          </button>
        </div>
      )}
      <form onSubmit={submit} className="login-form" autoComplete={password === STUDENT_DEFAULT_PASSWORD ? 'off' : 'on'}>
        <p className="login-lead" key={`lead-${intent}`}>{intent === 'admin' ? 'Staff console' : 'Learner hub'}</p>
        {intent === 'school' ? (
          <label>
            PIN
            <input inputMode="numeric" autoComplete="off" required minLength={6} maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="123456" />
          </label>
        ) : (
          <>
            <label>
              Email
              <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Password
              <input type="password" data-password-field="" autoComplete={password === STUDENT_DEFAULT_PASSWORD ? 'one-time-code' : 'current-password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
          </>
        )}
        {message && (
          <p className="login-error" role="alert">
            {message}
          </p>
        )}
        <button className="go" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Continue'}
        </button>
        <p className="login-hint" key={`hint-${intent}`}>
          {intent === 'admin'
            ? 'The first password is 123456. You choose a new one at the first sign-in.'
            : intent === 'individual'
              ? 'Use the email registered for you. The first password is 123456; you will be asked to change it.'
              : 'Enter PIN 123456 on the Windows computer where you registered. There is no username or password.'}
        </p>
        {resetNote ? <p className="login-hint">{resetNote}</p> : null}
        {intent === 'admin' ? (
          <button type="button" className="login-switch" disabled={busy} onClick={() => void forgotPassword()}>Forgot password?</button>
        ) : null}
        {intent === 'admin'
          ? <a className="login-switch" href="/login?as=school">Student sign in</a>
          : <a className="login-switch" href="/login?as=admin">Staff sign in</a>}
      </form>
    </div>
  );
}
