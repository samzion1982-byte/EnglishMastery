import { redirect } from 'next/navigation';
import { isSuperAdmin } from '@/lib/access';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { PermissionsManager } from './permissions-manager';

export default async function PermissionsPage() {
  const { role } = await getSessionRole();
  if (!isSuperAdmin(role)) redirect('/admin');
  return <PermissionsManager />;
}
