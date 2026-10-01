import { redirect } from 'next/navigation';
import { canOpenAdminPage, isSuperAdmin } from '@/lib/access';
import { loadRoleGrants } from '@/lib/grants';
import { createServerSupabase } from '@/lib/supabase-server';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { PermissionsManager } from './permissions-manager';

export default async function PermissionsPage() {
  const { role } = await getSessionRole();
  const grants = isSuperAdmin(role) ? {} : await loadRoleGrants(await createServerSupabase(), role || '');
  if (!canOpenAdminPage(role, 'permissions', grants)) redirect('/admin');
  return <PermissionsManager />;
}
