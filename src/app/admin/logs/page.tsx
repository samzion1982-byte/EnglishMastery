import { redirect } from 'next/navigation';
import { isSuperAdmin } from '@/lib/access';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { SpeechLog } from './speech-log';

export default async function LogsPage() {
  const { role } = await getSessionRole();
  if (!isSuperAdmin(role)) redirect('/admin/overview');
  return <SpeechLog />;
}
