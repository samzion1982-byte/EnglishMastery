import { NextResponse } from 'next/server';
import { getSessionRole } from '@/lib/supabase-server';
import { LICENCE_CSV_URL, parseLicenceCsv, licenceExpiry } from '@/lib/licence-csv';
export async function GET() {
  const auth = await getSessionRole();
  const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  if (!auth.user || !auth.active || auth.role !== 'super_admin') return reply({ error: 'Super Admin required.' }, 403);
  try {
    const response = await fetch(LICENCE_CSV_URL, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('Could not read licence validity from the CSV.');
    const rows = parseLicenceCsv(await response.text());
    const headers = rows.shift()?.map(value => value.trim().toLowerCase()) || [];
    for (const header of ['email', 'validity upto']) if (headers.filter(value => value === header).length !== 1) throw new Error('The CSV needs Email and Validity Upto columns.');
    const dates: Record<string, { date: string | null; error?: string }> = {};
    for (const row of rows) {
      const email = (row[headers.indexOf('email')] || '').trim().toLowerCase();
      if (!email) continue;
      if (dates[email]) { dates[email] = { date: null, error: 'Multiple CSV rows use this email.' }; continue; }
      try { dates[email] = { date: licenceExpiry(row[headers.indexOf('validity upto')] || '') }; }
      catch { dates[email] = { date: null, error: 'Invalid CSV validity date.' }; }
    }
    return reply({ dates });
  } catch (error) { return reply({ error: error instanceof Error ? error.message : 'CSV validity unavailable.' }, 503); }
}
