import { NextResponse } from 'next/server';
import { getSessionRole } from '@/lib/supabase-server';
import { readLicenceCsvText, parseLicenceCsv, licenceExpiry } from '@/lib/licence-csv';
export async function GET() {
  const auth = await getSessionRole();
  const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  if (!auth.user || !auth.active || auth.role !== 'super_admin') return reply({ error: 'Super Admin required.' }, 403);
  try {
    const rows = parseLicenceCsv(await readLicenceCsvText());
    const headers = rows.shift()?.map(value => value.trim().toLowerCase()) || [];
    for (const header of ['auth code', 'email', 'validity upto']) if (headers.filter(value => value === header).length !== 1) throw new Error('The CSV needs AUTH CODE, Email and Validity Upto columns.');
    const dates: Record<string, { date: string | null; error?: string }> = {};
    for (const row of rows) {
      const email = (row[headers.indexOf('auth code')] || '').trim().toUpperCase();
      if (!email) continue;
      if (dates[email]) { dates[email] = { date: null, error: 'Multiple CSV rows use this Auth Code.' }; continue; }
      try { dates[email] = { date: licenceExpiry(row[headers.indexOf('validity upto')] || '') }; }
      catch (error) { dates[email] = { date: null, error: error instanceof Error ? error.message : 'Invalid CSV validity date.' }; }
    }
    return reply({ dates });
  } catch (error) { return reply({ error: error instanceof Error ? error.message : 'CSV validity unavailable.' }, 503); }
}
