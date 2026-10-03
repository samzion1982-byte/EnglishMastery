import { redirect } from 'next/navigation';
import { canOpenAdminPage, isSchoolStaff } from '@/lib/access';
import { loadRoleGrants } from '@/lib/grants';
import { readSchoolPost } from '@/lib/school-post';
import { createServerSupabase } from '@/lib/supabase-server';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { ReportsManager } from './reports-manager';

export default async function ReportsPage() {
  const { role } = await getSessionRole();
  const supabase = await createServerSupabase();
  const post = isSchoolStaff(role) ? await readSchoolPost(supabase) : null;
  const grants = await loadRoleGrants(supabase, role || '');
  if (!canOpenAdminPage(role, 'reports', grants, post?.designation)) redirect('/admin/overview');
  return (
    <ReportsManager
      role={role || ''}
      designation={post?.designation || null}
      licenceId={post?.licenceId || null}
    />
  );
}
