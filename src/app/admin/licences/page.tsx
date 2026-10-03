import { redirect } from 'next/navigation';
import { isSuperAdmin } from '@/lib/access';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { LicencesManager } from './licences-manager';

export default async function LicencesPage() {
  const { role } = await getSessionRole();
  if (!isSuperAdmin(role)) redirect('/admin');
  return <LicencesManager />;
}
