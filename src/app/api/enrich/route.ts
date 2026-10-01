import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdminStaff } from '@/lib/access';
import { enrichRetryIn, lookupForStorage, type WikiTiming, type WordEntry } from '@/lib/dictionary';
import { createServerSupabase, getSessionRole } from '@/lib/supabase-server';

/** Words looked up per call. Wiktionary is paced inside the lookup, so a larger batch stays a steady stream. */
const BATCH = 40;
/** After this many failed lookups a word is set aside until an admin presses "Retry". */
const MAX_ATTEMPTS = 3;

type Row = { lemma: string; enriched_at: string | null; enrich_attempts: number };

async function staffClient() {
  const session = await getSessionRole();
  if (!session.user || !session.active || !isAdminStaff(session.role)) return null;
  return createServerSupabase();
}

/** Dictionary-only queue. Translation spending is isolated in Admin Settings. */
function pendingFilter() { return 'enriched_at.is.null'; }

async function counts(sb: SupabaseClient) {
  const base = () => sb.from('core_words').select('lemma', { count: 'exact', head: true }).neq('status', 'retired');
  const [total, open, failed] = await Promise.all([
    base(),
    base().or(pendingFilter()),
    base().or(pendingFilter()).gte('enrich_attempts', MAX_ATTEMPTS),
  ]);
  const error = total.error || open.error || failed.error;
  if (error) throw new Error(error.message);
  const all = total.count ?? 0;
  const missing = open.count ?? 0;
  const stuck = failed.count ?? 0;
  return { total: all, ready: all - missing, pending: missing - stuck, failed: stuck, translator: false };
}

function fail(err: unknown, status = 500) {
  const message = err instanceof Error ? err.message : 'Something went wrong.';
  const hint = /enrich|enriched_at|translated_at|auto_ta/.test(message) ? ' Run the 20260923170000_word_enrichment.sql migration.' : '';
  return NextResponse.json({ error: message + hint }, { status });
}

export async function GET() {
  const sb = await staffClient();
  if (!sb) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json(await counts(sb));
  } catch (err) {
    return fail(err);
  }
}

type WordTiming = WikiTiming & { lemma: string; totalMs: number };

/** Lemmas that just hit a rate limit. Kept out of the next batches so the queue can move on. */
const deferUntil = new Map<string, number>();

function deferredLemmas() {
  const now = Date.now();
  for (const [lemma, until] of deferUntil) if (until <= now) deferUntil.delete(lemma);
  return [...deferUntil.keys()];
}

function defer(lemmas: Iterable<string>) {
  const until = Date.now() + enrichRetryIn() * 1000;
  for (const lemma of lemmas) deferUntil.set(lemma, until);
}

function msSince(start: number) {
  return Date.now() - start;
}

/** Looks up the next few words, saves what it found and reports progress. `{ retry: true }` releases set-aside words. */
export async function POST(request: Request) {
  const batchStarted = Date.now();
  const sb = await staffClient();
  if (!sb) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { retry?: boolean };

  try {
    if (body.retry) {
      const { error } = await sb.from('core_words').update({ enrich_attempts: 0, enrich_error: null }).gte('enrich_attempts', MAX_ATTEMPTS);
      if (error) throw new Error(error.message);
      return NextResponse.json(await counts(sb));
    }

    const selectStarted = Date.now();
    const skip = deferredLemmas();
    let query = sb
      .from('core_words')
      .select('lemma, enriched_at, enrich_attempts')
      .neq('status', 'retired')
      .or(pendingFilter())
      .lt('enrich_attempts', MAX_ATTEMPTS)
      .order('list_order', { ascending: true })
      .order('lemma', { ascending: true })
      .limit(BATCH);
    if (skip.length) query = query.not('lemma', 'in', `(${skip.map((lemma) => `"${lemma.replace(/"/g, '')}"`).join(',')})`);
    const { data, error } = await query;
    const selectMs = msSince(selectStarted);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as Row[];
    if (!rows.length) {
      const progress = await counts(sb);
      if (skip.length && progress.pending > 0) return NextResponse.json({ ...progress, processed: [], retryIn: enrichRetryIn() });
      return NextResponse.json({ ...progress, processed: [] });
    }

    const needLookup = rows.filter((r) => !r.enriched_at);
    const lookups = new Map<string, WordEntry | null>();
    const wordTimings: WordTiming[] = [];
    const lookupStarted = Date.now();
    await Promise.all(
      needLookup.map(async (r) => {
        const wordStarted = Date.now();
        const timing: WikiTiming = { queueMs: 0, cooldownMs: 0, httpMs: 0, status: 'error' };
        lookups.set(r.lemma, await lookupForStorage(r.lemma, timing).catch(() => null));
        wordTimings.push({ lemma: r.lemma, ...timing, totalMs: msSince(wordStarted) });
      }),
    );
    const lookupMs = msSince(lookupStarted);
    const lookupFailures = needLookup.filter((r) => !lookups.get(r.lemma)).length;
    const limited = new Set(wordTimings.filter((t) => t.status === 429 || t.status === 503).map((t) => t.lemma));
    if (limited.size) defer(limited);
    const outage = false;

    const now = new Date().toISOString();
    const processed: string[] = [];
    const saveStarted = Date.now();
    await Promise.all(
      rows.map(async (row) => {
        const patch: Record<string, unknown> = {};
        const entry = lookups.get(row.lemma);
        if (!row.enriched_at && entry) {
          patch.enrichment = entry;
          patch.enriched_at = now;
        }
        if (!row.enriched_at && !entry && !outage && !limited.has(row.lemma)) {
          patch.enrich_attempts = row.enrich_attempts + 1;
          patch.enrich_error = 'Dictionary lookup failed';
        } else if (patch.enriched_at) {
          patch.enrich_error = null;
        }
        if (!Object.keys(patch).length) return;
        const { error: saveError } = await sb.from('core_words').update(patch).eq('lemma', row.lemma);
        if (saveError) throw new Error(saveError.message);
        if (patch.enriched_at) processed.push(row.lemma);
      }),
    );
    const saveMs = msSince(saveStarted);

    const countStarted = Date.now();
    const progress = await counts(sb);
    const countMs = msSince(countStarted);
    const slowest = [...wordTimings].sort((a, b) => b.totalMs - a.totalMs)[0];
    const http = wordTimings.map((t) => t.httpMs).sort((a, b) => a - b);
    const mid = http[Math.floor(http.length / 2)] ?? 0;
    const debug = {
      words: rows.length,
      saved: processed.length,
      failed: lookupFailures,
      selectMs,
      lookupMs,
      saveMs,
      countMs,
      totalMs: msSince(batchStarted),
      httpMedianMs: mid,
      slowest: slowest ? { lemma: slowest.lemma, totalMs: slowest.totalMs, queueMs: slowest.queueMs, cooldownMs: slowest.cooldownMs, httpMs: slowest.httpMs, status: slowest.status } : null,
    };
    console.log('[enrich]', JSON.stringify(debug));
    const stalled = processed.length === 0 && limited.size > 0;
    if (stalled) return NextResponse.json({ ...progress, processed, debug, retryIn: enrichRetryIn() });
    return NextResponse.json({ ...progress, processed, debug });
  } catch (err) {
    return fail(err);
  }
}
