export type LoginIntent = 'school' | 'individual' | 'admin';
export const LOGIN_PREFERENCE_KEY = 'em-login-as';

export function loginIntent(value: unknown): LoginIntent | null {
  return value === 'school' || value === 'individual' || value === 'admin' ? value : null;
}

export function readLoginPreference(): LoginIntent | null {
  try { return loginIntent(localStorage.getItem(LOGIN_PREFERENCE_KEY)); }
  catch { return null; }
}

export function rememberLoginPreference(intent: LoginIntent) {
  // This is a UI preference, never an authentication credential.
  try { localStorage.setItem(LOGIN_PREFERENCE_KEY, intent); } catch { /* Storage may be blocked. */ }
  try {
    document.cookie = LOGIN_PREFERENCE_KEY + '=' + intent + '; Path=/; Max-Age=31536000; SameSite=Lax'
      + (window.location.protocol === 'https:' ? '; Secure' : '');
  } catch { /* Remembering a tab must never prevent sign-in. */ }
}
