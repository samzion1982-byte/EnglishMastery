import { NextResponse } from 'next/server';
import { canOpenAdminPage } from '@/lib/access';
import { loadRoleGrants } from '@/lib/grants';
import { buildSpeechWorkbook } from '@/lib/excel-speech';
import { mapSpeechRow, summarizeSpeechUsage, type SpeechUsageRow } from '@/lib/speech-usage';
import { SPEAK_MODEL } from '@/lib/speaking-transcribe';
import { createServerSupabase, getSessionRole } from '@/lib/supabase-server';

export const runtime = 'nodejs';

const noStore = { 'Cache-Control': 'no-store' };

async function loadRows() {
  const since = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('speech_usage_rows', { p_since: since });
  if (error) {
    const missing = /speech_usage_rows|em_speech_usage|schema cache|does not exist/i.test(error.message);
    return { rows: [] as SpeechUsageRow[], missing, failed: !missing };
  }
  const rows = (Array.isArray(data) ? data : [])
    .map((row) => mapSpeechRow(row as Record<string, unknown>))
    .filter((row): row is SpeechUsageRow => !!row);
  return { rows, missing: false, failed: false };
}

export async function GET(request: Request) {
  const { user, role, active } = await getSessionRole();
  const grants = user && active ? await loadRoleGrants(await createServerSupabase(), role || '') : {};
  if (!user || !active || !canOpenAdminPage(role, 'logs', grants)) {
    return NextResponse.json({ error: 'Logs permission required' }, { status: 403, headers: noStore });
  }
  const url = new URL(request.url);
  const tz = Number(url.searchParams.get('tz'));
  const tzOffsetMin = Number.isFinite(tz) ? Math.min(14 * 60, Math.max(-12 * 60, Math.round(tz))) : 0;
  const loaded = await loadRows();
  if (loaded.missing) return NextResponse.json({ missing: true }, { status: 503, headers: noStore });
  if (loaded.failed) return NextResponse.json({ error: 'Could not read the speech log.' }, { status: 500, headers: noStore });
  const report = summarizeSpeechUsage(loaded.rows, Date.now(), tzOffsetMin, SPEAK_MODEL);
  if (url.searchParams.get('format') === 'xlsx') {
    const bytes = await buildSpeechWorkbook(loaded.rows, report);
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        ...noStore,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Speech recognition ${stamp}.xlsx"`,
      },
    });
  }
  return NextResponse.json({ report }, { headers: noStore });
}
