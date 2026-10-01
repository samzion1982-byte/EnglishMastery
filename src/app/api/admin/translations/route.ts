import { NextResponse } from 'next/server';
import { isAdminStaff, isFullAccess } from '@/lib/access';
import { createServerSupabase, getSessionRole } from '@/lib/supabase-server';
import { translateWords, translatorReady, type TongueLang } from '@/lib/azure-translate';
import { translateFallback } from '@/lib/fallback-translate';

const LANGUAGES = new Set(['ta', 'hi', 'ml', 'te', 'fr', 'kn']);
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const fail = (error: unknown) => reply({ error: error instanceof Error ? error.message : 'Translation sync failed.' }, 503);

async function session() {
  const auth = await getSessionRole();
  return { ...auth, allowed: !!auth.user && auth.active && isAdminStaff(auth.role), manage: !!auth.user && auth.active && isFullAccess(auth.role) };
}

export async function GET() {
  const auth = await session();
  if (!auth.allowed) return reply({ error: 'Unauthorized' }, 403);
  try {
    const sb = await createServerSupabase();
    const { data, error } = await sb.rpc('translation_coverage');
    if (error) return reply({ error: 'Translation controls need the 20260924190000_translation_controls.sql Supabase migration.', setupRequired: true }, 503);
    return reply({ languages: data, canManage: auth.manage, configured: translatorReady() });
  } catch (error) { return fail(error); }
}

export async function PATCH(request: Request) {
  const auth = await session();
  if (!auth.manage) return reply({ error: 'Super Admin required' }, 403);
  const body = await request.json().catch(() => null);
  if (!body || !LANGUAGES.has(body.language) || typeof body.enabled !== 'boolean') return reply({ error: 'Choose a supported language and an enabled value.' }, 400);
  try {
    const sb = await createServerSupabase();
    const { error } = await sb.rpc('translation_set_language', { p_language: body.language, p_enabled: body.enabled });
    if (error) throw new Error(error.message);
    return reply({ saved: true });
  } catch (error) { return fail(error); }
}

/** One atomic batch; settings are read again for every claim. No automatic retries on errors. */
export async function POST(request: Request) {
  const auth = await session();
  if (!auth.manage) return reply({ error: 'Super Admin required' }, 403);
  const body = await request.json().catch(() => null);
  if (!body || !['sync', 'retry'].includes(body.action)) return reply({ error: 'Choose sync or retry.' }, 400);
  try {
    const sb = await createServerSupabase();
    if (body.action === 'retry') {
      if (!LANGUAGES.has(body.language)) return reply({ error: 'Unsupported language' }, 400);
      const { error } = await sb.rpc('translation_retry', { p_language: body.language });
      if (error) throw new Error(error.message);
      return reply({ released: true });
    }
    if (body.language !== undefined && !LANGUAGES.has(body.language)) return reply({ error: 'Unsupported language' }, 400);
    if (!translatorReady()) return reply({ error: 'Azure Translator is not configured.' }, 503);
    const { data, error } = body.language
      ? await sb.rpc('translation_claim_language', { p_language: body.language })
      : await sb.rpc('translation_claim_batch');
    if (error && body.language && error.code === 'PGRST202') return reply({ error: 'Run the 20260924200000_translation_language_sync.sql Supabase migration to enable individual language sync.' }, 503);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as { lemma: string; language: TongueLang; claim_id: string }[];
    if (!rows.length) return reply({ processed: 0 });
    const lang = rows[0].language;
    let texts: (string | null)[] = rows.map(() => null);
    try { texts = await translateWords(rows.map(r => r.lemma), lang); }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Azure request failed.';
      const alt = await translateFallback(rows.map(r => r.lemma), lang);
      if (!alt.some(Boolean)) {
        const result = await sb.rpc('translation_finish', { p_claim: rows[0].claim_id, p_results: [], p_error: message });
        if (result.error) throw new Error('Sync stopped. The batch remains reserved because its failure could not be saved. Check coverage before retrying.');
        throw new Error(message);
      }
      texts = alt;
    }
    const gaps = texts.flatMap((text, index) => (text ? [] : [index]));
    if (gaps.length && texts.some(Boolean)) {
      const alt = await translateFallback(gaps.map(index => rows[index].lemma), lang);
      gaps.forEach((index, slot) => { if (alt[slot]) texts[index] = alt[slot]; });
    } else if (gaps.length === texts.length) {
      texts = await translateFallback(rows.map(r => r.lemma), lang);
    }
    const { error: saveError } = await sb.rpc('translation_finish', {
      p_claim: rows[0].claim_id, p_results: rows.map((r, i) => ({ lemma: r.lemma, text: texts[i] })), p_error: null,
    });
    if (saveError) throw new Error('Azure returned results, but saving failed. Sync stopped; the batch stays reserved to prevent an automatic duplicate request.');
    return reply({ processed: rows.length, language: rows[0].language });
  } catch (error) { return fail(error); }
}
