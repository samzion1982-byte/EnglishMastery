import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ADMIN_PAGES } from './access';

function grantsFrom(rows: { page_key: string; allowed: boolean }[] | null) {
  const grants: Record<string, boolean> = {};
  for (const page of ADMIN_PAGES) {
    if (page.alwaysOn) grants[page.key] = true;
  }
  for (const row of rows || []) grants[row.page_key] = !!row.allowed;
  return grants;
}

export const loadRoleGrants = cache(async function loadRoleGrants(client: SupabaseClient, role: string) {
  const viaLevel = await client.rpc('my_page_grants');
  if (!viaLevel.error) return grantsFrom(viaLevel.data as { page_key: string; allowed: boolean }[] | null);
  if (!/my_page_grants|schema cache|does not exist/i.test(viaLevel.error.message)) return {} as Record<string, boolean>;
  const { data, error } = await client.from('em_role_page_access').select('page_key, allowed').eq('role', role);
  if (error) return {} as Record<string, boolean>;
  return grantsFrom(data);
});

export async function loadAllRoleGrants(client: SupabaseClient) {
  const { data, error } = await client.from('em_role_page_access').select('role, page_key, allowed');
  if (error) throw error;
  const byRole: Record<string, Record<string, boolean>> = {};
  for (const row of data || []) {
    if (!byRole[row.role]) byRole[row.role] = {};
    byRole[row.role][row.page_key] = !!row.allowed;
  }
  return byRole;
}
