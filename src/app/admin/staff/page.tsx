import { redirect } from 'next/navigation';
import { canOpenAdminPage, isSchoolStaff } from '@/lib/access';
import { loadRoleGrants } from '@/lib/grants';
import { readSchoolPost } from '@/lib/school-post';
import { createServerSupabase } from '@/lib/supabase-server';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { PrincipalStaff } from './principal-staff';

export default async function StaffPage() {
  const { role } = await getSessionRole();
  const supabase = await createServerSupabase();
  const post = isSchoolStaff(role) ? await readSchoolPost(supabase) : null;
  const grants = await loadRoleGrants(supabase, role || '');
  if (!canOpenAdminPage(role, 'users', grants, post?.designation)) redirect('/admin/overview');
  if (!post?.licenceId) {
    return <p className="notice error" role="alert">Run supabase/migrations/20260926340000_staff_school_link.sql in the Supabase SQL editor, then open Staff again.</p>;
  }
  return <PrincipalStaff licenceId={post.licenceId} school={post.school || 'Your school'} code={post.code} />;
}
