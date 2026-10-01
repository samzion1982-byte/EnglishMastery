import { redirect } from 'next/navigation';
import { canOpenAdminPage, isSchoolStaff, isSuperAdmin } from '@/lib/access';
import { loadRoleGrants } from '@/lib/grants';
import { readSchoolPost } from '@/lib/school-post';
import { createServerSupabase } from '@/lib/supabase-server';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { AppendixAdmin } from '../appendix-admin';

export default async function AppendixPage() {
  const { role } = await getSessionRole();
  const supabase = await createServerSupabase();
  const grants = isSuperAdmin(role) ? {} : await loadRoleGrants(supabase, role || '');
  const post = isSchoolStaff(role) ? await readSchoolPost(supabase) : null;
  if (!canOpenAdminPage(role, 'appendix', grants, post?.designation)) redirect(isSchoolStaff(role) ? '/admin/overview' : '/admin');
  return <AppendixAdmin />;
}
