import { createBrowserClient } from '@supabase/ssr';

export function createBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration is missing.');
  return createBrowserClient(url, key);
}

export function getSupabase() {
  return createBrowserSupabase();
}

export const ADMIN_ROLES = ['super_admin'] as const;
