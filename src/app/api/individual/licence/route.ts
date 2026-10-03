import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase-server';
import { readCsvLicence } from '@/lib/licence-csv';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Invalid request origin.' }, 403);
  const client = await createServerSupabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user?.email) return reply({ error: 'Sign in first.' }, 401);
  try {
    const body = await request.json();
    if (!body || typeof body.device !== 'string' || body.device.length > 80 || (body.key !== undefined && (typeof body.key !== 'string' || body.key.length > 160))) return reply({ error: 'Invalid licence request.' }, 400);
    const context = await client.rpc('my_csv_licence_context');
    if (context.error) throw new Error('Apply the Google CSV licence migration first.');
    if (!context.data) throw new Error('This account has no individual licence.');
    const key = body.key?.trim() || context.data.key;
    if (!key) return reply({ needsKey: true });
    const verified = await readCsvLicence(key, user.email);
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !url) throw new Error('The server licence connection needs SUPABASE_SERVICE_ROLE_KEY.');
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const stored = await admin.rpc('record_csv_licence', { p_user_id: user.id, p_key: verified.key, p_until: verified.validUntil });
    if (stored.error) throw new Error(stored.error.message);
    const activation = await client.rpc('activate_csv_individual_session', { p_device: body.device });
    if (activation.error) throw new Error(activation.error.message);
    return reply({ ok: true });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : 'The licence sheet could not be checked.' }, 403);
  }
}
