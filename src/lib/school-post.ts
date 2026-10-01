import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

export type SchoolPost = {
  designation: string | null;
  licenceId: string | null;
  school: string | null;
  code: string | null;
  email: string | null;
  name: string | null;
};

const empty: SchoolPost = { designation: null, licenceId: null, school: null, code: null, email: null, name: null };

export const readSchoolPost = cache(async function readSchoolPost(client: SupabaseClient): Promise<SchoolPost> {
  const { data, error } = await client.rpc('my_school_staff');
  if (error || !data || typeof data !== 'object') return empty;
  const row = data as { designation?: string; licence_id?: string; school?: string; school_code?: string; email?: string; name?: string };
  return {
    designation: row.designation || null,
    licenceId: row.licence_id || null,
    school: row.school || null,
    code: row.school_code || null,
    email: row.email || null,
    name: row.name || null,
  };
});
