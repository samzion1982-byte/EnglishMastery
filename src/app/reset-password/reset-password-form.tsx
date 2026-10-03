'use client';

import { useEffect, useMemo, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase';
import { STUDENT_DEFAULT_PASSWORD } from '@/lib/access';

export function ResetPasswordForm() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('Open the link in the reset email, then choose a new password.');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive && data.session) setReady(true);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    return () => {
      alive = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) {
      setError('Open the link in the reset email first. You can also ask Super Admin to reset the password.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    if (password === STUDENT_DEFAULT_PASSWORD) {
      setError('Pick something other than 123456.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const { error } = await supabase.rpc('set_account_password', { p_password: password });
      if (error) throw error;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: flagError } = await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id).select('id');
        if (flagError) throw flagError;
      }
      window.location.assign('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <p className="login-lead">Choose a new password</p>
      <p className="login-hint">For individual accounts, Super Admin can view the saved password for account recovery.</p>
      <p className="login-hint">{message}</p>
      <label>
        New password
        <input type="password" required minLength={6} value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} />
      </label>
      <label>
        Confirm
        <input type="password" required minLength={6} value={confirm} onChange={(event) => { setConfirm(event.target.value); setError(''); }} />
      </label>
      {error ? <p className="login-error" role="alert">{error}</p> : null}
      <button className="go" type="submit" disabled={busy || !ready}>
        {busy ? 'Saving…' : 'Save password'}
      </button>
    </form>
  );
}
