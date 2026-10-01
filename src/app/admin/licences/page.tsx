import { redirect } from 'next/navigation';
import { canOpenAdminPage, isSuperAdmin } from '@/lib/access';
import { loadRoleGrants } from '@/lib/grants';
import { createServerSupabase } from '@/lib/supabase-server';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { LicencesManager } from './licences-manager';

export default async function LicencesPage() {
  const { role } = await getSessionRole();
  const grants = isSuperAdmin(role) ? {} : await loadRoleGrants(await createServerSupabase(), role || '');
  if (!canOpenAdminPage(role, 'licences', grants)) redirect('/admin');
  return <LicencesManager />;
}
