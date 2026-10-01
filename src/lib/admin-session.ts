import { cache } from 'react';
import { headers } from 'next/headers';
import { isAdminStaff, isSchoolStaff } from './access';
import { getSessionRole } from './supabase-server';

// Request-local only: the proxy overwrites this header after validating the
// user and current profile. Never store this session across requests/users.
export const getAdminSessionRole = cache(async function getAdminSessionRole() {
  const value = (await headers()).get('x-em-admin-session');
  if (value) {
    try {
      const session = JSON.parse(decodeURIComponent(value)) as {
        user?: { id?: unknown }; role?: unknown; name?: unknown; active?: unknown; mustChange?: unknown;
      };
      if (typeof session.user?.id === 'string' && typeof session.role === 'string'
        && (isAdminStaff(session.role) || isSchoolStaff(session.role))
        && session.active === true && session.mustChange === false) {
        return { user: { id: session.user.id }, role: session.role,
          name: typeof session.name === 'string' ? session.name : undefined,
          active: true, mustChange: false };
      }
    } catch { /* Missing/invalid context uses the usual verified lookup. */ }
  }
  return getSessionRole();
});
