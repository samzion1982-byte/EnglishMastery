import { redirect } from 'next/navigation';
import { canOpenAdminPage, isSchoolStaff, isSuperAdmin } from '@/lib/access';
import { loadRoleGrants } from '@/lib/grants';
import { readSchoolPost } from '@/lib/school-post';
import { createServerSupabase } from '@/lib/supabase-server';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { UsersManager } from './users-manager';

export default async function UsersPage() {
  const { role } = await getSessionRole();
  const supabase = await createServerSupabase();
  const [grants, post] = await Promise.all([
    isSuperAdmin(role) ? {} : loadRoleGrants(supabase, role || ''),
    isSchoolStaff(role) ? readSchoolPost(supabase) : null,
  ]);
  if (!canOpenAdminPage(role, 'users', grants, post?.designation)) redirect(isSchoolStaff(role) ? '/admin/overview' : '/admin');
  if (isSchoolStaff(role)) redirect('/admin/staff');
  return <UsersManager />;
}
