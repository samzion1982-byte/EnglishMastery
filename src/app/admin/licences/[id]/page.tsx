import { redirect } from 'next/navigation';
import { isSuperAdmin } from '@/lib/access';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { SchoolDesk } from '../school-desk';

export default async function SchoolLicencePage({ params }: { params: Promise<{ id: string }> }) {
  const { role } = await getSessionRole();
  if (!isSuperAdmin(role)) redirect('/admin');
  const { id } = await params;
  return <SchoolDesk licenceId={id} />;
}
