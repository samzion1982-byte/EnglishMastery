import type { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabase-server';
import { JoinForm } from './join-form';

export const metadata: Metadata = { title: 'Register | English Mastery' };

export default async function ShortJoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = decodeURIComponent(code);
  const supabase = await createServerSupabase();
  const { data } = await supabase.rpc('school_join_info', { p_code: token });
  const info = data && typeof data === 'object' ? data as { ok?: boolean; name?: string; open?: boolean } : null;
  return <JoinForm code={token} info={info} />;
}
