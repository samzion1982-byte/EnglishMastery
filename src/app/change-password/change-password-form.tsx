'use client';

import { useMemo, useState } from 'react';
import { createBrowserSupabase } from '@/lib/supabase';
import { isAdminStaff, isSchoolStaff, STUDENT_DEFAULT_PASSWORD } from '@/lib/access';

export function ChangePasswordForm() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Use at least 6 characters.');
      return;
    }
    if (password === STUDENT_DEFAULT_PASSWORD) {
      setError('Pick something other than 123456.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error: flagError } = await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id).select('id');
        if (flagError) throw flagError;
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id || '').maybeSingle();
      window.location.assign(isAdminStaff(profile?.role) || isSchoolStaff(profile?.role) ? '/admin/overview' : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setBusy(false);
    }
  }

  const mismatch = confirm.length >= password.length && password !== confirm;
  return (
    <form className="login-form" onSubmit={submit}>
      <p className="login-lead">Your first password is 123456. Choose a new one that only you know.</p>
      <label>
        New password
        <input type="password" required minLength={6} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} />
      </label>
      <label>
        Confirm
        <input type="password" required minLength={6} value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(''); }} />
      </label>
      {error || mismatch ? (
        <p className="login-error" role="alert">{error || 'The two passwords do not match.'}</p>
      ) : null}
      <button className="go" type="submit" disabled={busy}>
        {busy ? 'Saving…' : 'Save password'}
      </button>
    </form>
  );
}
