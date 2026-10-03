import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { readCsvLicence } from '@/lib/licence-csv';
export async function GET() {
  const client = await createServerSupabase();
  const { data: { user } } = await client.auth.getUser();
  const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  if (!user?.email) return reply({ error: 'Sign in first.' }, 401);
  const context = await client.rpc('my_csv_licence_context');
  if (context.error) return reply({ error: 'CSV validity unavailable.' }, 503);
  if (!context.data) return reply({ individual: false });
  if (!context.data.key) return reply({ individual: true, error: 'Validate your CSV licence first.' }, 403);
  try { const licence = await readCsvLicence(context.data.key, context.data.purchaser_email); return reply({ individual: true, valid_until: licence.validUntil }); }
  catch { return reply({ individual: true, error: 'CSV validity unavailable.' }, 503); }
}
