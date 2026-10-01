import { redirect } from 'next/navigation';
import { canOpenReports, isSchoolStaff } from '@/lib/access';
import { readSchoolPost } from '@/lib/school-post';
import { createServerSupabase } from '@/lib/supabase-server';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { ReportsManager } from './reports-manager';

export default async function ReportsPage() {
  const { role } = await getSessionRole();
  const supabase = await createServerSupabase();
  const post = isSchoolStaff(role) ? await readSchoolPost(supabase) : null;
  if (!canOpenReports(role, post?.designation)) redirect('/admin/overview');
  return (
    <ReportsManager
      role={role || ''}
      designation={post?.designation || null}
      licenceId={post?.licenceId || null}
    />
  );
}
