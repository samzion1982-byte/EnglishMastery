import { loadRoleGrants } from '@/lib/grants';
import { createServerSupabase } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { canOpenAdminPage } from '@/lib/access';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { LogsManager } from './logs-manager';

export default async function LogsPage() {
  const { role } = await getSessionRole();
  const grants = await loadRoleGrants(await createServerSupabase(), role || '');
  if (!canOpenAdminPage(role, 'logs', grants)) redirect('/admin/overview');
  return <LogsManager />;
}
