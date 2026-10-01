import { redirect } from 'next/navigation';
import { isAdminStaff, isSchoolStaff } from '@/lib/access';
import { getSessionRole } from '@/lib/supabase-server';

export default async function StaffHomePage() {
  const { user, role, mustChange } = await getSessionRole();
  if (!user) redirect('/login?as=admin');
  if (mustChange) redirect('/change-password');
  if (isAdminStaff(role) || isSchoolStaff(role)) redirect('/admin/overview');
  redirect('/');
}
