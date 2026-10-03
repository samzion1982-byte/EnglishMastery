import { NextResponse } from 'next/server';
import { createServerSupabase, getSessionRole } from '@/lib/supabase-server';
import { readCsvLicence } from '@/lib/licence-csv';
export async function POST(request: Request) {
  const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  const auth = await getSessionRole();
  if (!auth.user || !auth.active || auth.role !== 'super_admin') return reply({ error: 'Super Admin required.' }, 403);
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Invalid origin.' }, 403);
  try {
    const body = await request.json();
    if (!body?.details || typeof body.details.auth_code !== 'string' || typeof body.details.contact_email !== 'string' || typeof body.details.login_email !== 'string') return reply({ error: 'Enter purchaser email, login email and Auth Code.' }, 400);
    const licence = await readCsvLicence(body.details.auth_code, body.details.contact_email);
    const client = await createServerSupabase();
    const result = await client.rpc('save_individual_purchase', { p_details: { ...body.details, auth_code: licence.key, valid_until: licence.validUntil }, p_role: body.role });
    if (result.error) throw new Error(result.error.message);
    return reply(result.data);
  } catch (error) { return reply({ error: error instanceof Error ? error.message : 'Could not save purchase.' }, 400); }
}
