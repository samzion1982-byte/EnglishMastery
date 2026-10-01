import { redirect } from 'next/navigation';
import { AdminFrame } from '@/components/admin-frame';
import { isAdminStaff, isSchoolStaff, isSuperAdmin } from '@/lib/access';
import { loadRoleGrants } from '@/lib/grants';
import { readSchoolPost } from '@/lib/school-post';
import { createServerSupabase } from '@/lib/supabase-server';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';

export const metadata = { title: 'Admin | English Mastery' };

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, role, name, mustChange } = await getSessionRole();
  if (!user) redirect('/login?as=admin');
  if (mustChange) redirect('/change-password');
  if (!isAdminStaff(role) && !isSchoolStaff(role)) redirect('/login?as=admin&error=not-admin');
  const supabase = await createServerSupabase();
  const [grants, post] = await Promise.all([
    isSuperAdmin(role) ? {} : loadRoleGrants(supabase, role || ''),
    isSchoolStaff(role) ? readSchoolPost(supabase) : null,
  ]);
  return (
    <div className="admin-shell">
      <AdminFrame role={role || ''} name={name} grants={grants} designation={post?.designation || null}>
        {children}
      </AdminFrame>
    </div>
  );
}
