import { cache } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createServerSupabase = cache(async function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase configuration is missing.');
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            store.set(name, value, options);
          } catch {
            /* Called from a Server Component; proxy refreshes the session. */
          }
        });
      },
    },
  });
});

export const getSessionRole = cache(async function getSessionRole() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, role: null as string | null, name: undefined as string | undefined, mustChange: false, active: true };
  const { data } = await supabase
    .from('profiles')
    .select('role, display_name, nickname, must_change_password, is_active')
    .eq('id', user.id)
    .maybeSingle();
  return {
    user,
    role: data?.role ?? 'student',
    name: (data?.nickname || data?.display_name) as string | undefined,
    mustChange: !!data?.must_change_password,
    active: data?.is_active !== false,
  };
});
