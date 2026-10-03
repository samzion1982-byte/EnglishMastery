import { NextResponse } from 'next/server';
import { canOpenAdminPage } from '@/lib/access';
import { loadRoleGrants } from '@/lib/grants';
import { createServerSupabase, getSessionRole } from '@/lib/supabase-server';

export async function GET() {
  const auth = await getSessionRole();
  const supabase = await createServerSupabase();
  const grants = auth.user && auth.active ? await loadRoleGrants(supabase, auth.role || '') : {};
  const headers = { 'Cache-Control': 'no-store' };
  if (!auth.user || !auth.active || !canOpenAdminPage(auth.role, 'logs', grants)) {
    return NextResponse.json({ error: 'Logs permission required' }, { status: 403, headers });
  }
  const { data, error } = await supabase.rpc('login_session_rows');
  if (error) {
    const missing = /could not find|does not exist|schema cache/i.test(error.message);
    return NextResponse.json({ error: missing ? 'Apply the login session logs SQL migration to enable tracking.' : 'Could not load login sessions.' }, { status: missing ? 503 : 500, headers });
  }
  return NextResponse.json({ rows: data || [], checkedAt: Date.now() }, { headers });
}
