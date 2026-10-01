import { redirect } from 'next/navigation';
import { canOpenAdminPage, isFullAccess, isSchoolStaff, isSuperAdmin } from '@/lib/access';
import { loadRoleGrants } from '@/lib/grants';
import { readSchoolPost } from '@/lib/school-post';
import { createServerSupabase } from '@/lib/supabase-server';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { CoreVocabAdmin } from './core-vocab-admin';

export default async function AdminPage() {
  const { role } = await getSessionRole();
  const supabase = await createServerSupabase();
  const [grants, post] = await Promise.all([
    isSuperAdmin(role) ? {} : loadRoleGrants(supabase, role || ''),
    isSchoolStaff(role) ? readSchoolPost(supabase) : null,
  ]);
  if (!canOpenAdminPage(role, 'core-vocabulary', grants, post?.designation)) redirect('/admin/overview');
  return <CoreVocabAdmin canFlush={isFullAccess(role)} />;
}
