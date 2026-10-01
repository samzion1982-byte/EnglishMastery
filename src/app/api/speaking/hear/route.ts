import { NextResponse } from 'next/server';
import { keywordScore, keywordsInPassage, passageCoverage } from '@/lib/speaking-lines';
import { SpeakCheckError, SPEAK_MODEL, transcribeLine } from '@/lib/speaking-transcribe';
import { createServerSupabase, getSessionRole } from '@/lib/supabase-server';

export const runtime = 'nodejs';

const MAX_BYTES = 6_000_000;
const recent = new Map<string, number[]>();

function limited(userId: string) {
  const now = Date.now();
  const hits = (recent.get(userId) ?? []).filter((at) => now - at < 60_000);
  if (hits.length >= 12) return true;
  hits.push(now);
  recent.set(userId, hits);
  return false;
}

async function openSpeechLog(bytes: number, audioMs: number) {
  try {
    const supabase = await createServerSupabase();
    const begun = await supabase.rpc('begin_speech_check', {
      p_model: SPEAK_MODEL,
      p_bytes: bytes,
      p_audio_ms: audioMs,
      p_level: 'beginner',
    });
    return begun.error || typeof begun.data !== 'string' ? null : begun.data;
  } catch {
    return null;
  }
}

async function closeSpeechLog(id: string | null, status: string, started: number, matched: number | null, total: number | null, httpStatus: number) {
  if (!id) return;
  try {
    const supabase = await createServerSupabase();
    await supabase.rpc('finish_speech_check', {
      p_id: id,
      p_status: status,
      p_latency_ms: Date.now() - started,
      p_matched: matched,
      p_total: total,
      p_http: httpStatus,
    });
  } catch {
    /* The reading still scores if the usage log is unavailable. */
  }
}

export async function POST(request: Request) {
  const { user, active } = await getSessionRole();
  if (!user || !active) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const passage = form?.get('passage');
  const audio = form?.get('audio');
  let keywords: unknown = null;
  try {
    keywords = JSON.parse(typeof form?.get('keywords') === 'string' ? String(form.get('keywords')) : '');
  } catch {
    keywords = null;
  }
  const words = Array.isArray(keywords) ? keywords.filter((word): word is string => typeof word === 'string') : [];
  if (typeof passage !== 'string' || passage.length < 40 || passage.length > 1200 || words.length < 5 || words.length > 8 || words.some((word) => word.length < 2 || word.length > 40) || !keywordsInPassage(passage, words)) {
    return NextResponse.json({ error: 'Read the beginner passage.' }, { status: 400 });
  }
  const type = audio instanceof Blob ? (audio.type || 'audio/webm') : '';
  if (!(audio instanceof Blob) || !type.startsWith('audio/') || audio.size < 800 || audio.size > MAX_BYTES) {
    return NextResponse.json({ error: 'That reading was too short or too long. Read the passage once, then stop.' }, { status: 400 });
  }
  const audioMs = Math.min(180_000, Math.max(0, Math.round(Number(form?.get('audioMs')) || 0)));
  const started = Date.now();
  const logId = await openSpeechLog(audio.size, audioMs);
  if (limited(user.id)) {
    await closeSpeechLog(logId, 'capped', started, null, words.length, 429);
    return NextResponse.json({ error: 'The speaking check is busy. Try this passage again in a moment.' }, { status: 429, headers: { 'Cache-Control': 'no-store', 'Retry-After': '20' } });
  }
  try {
    const result = await transcribeLine(passage, audio, type);
    const score = result.silent ? { words: words.map((word) => ({ word, hit: false })), matched: 0, total: words.length } : keywordScore(words, result.heard);
    await closeSpeechLog(logId, result.silent ? 'silent' : 'ok', started, score.matched, score.total, 200);
    const coverage = passageCoverage(passage, result.heard);
    return NextResponse.json({
      passageWordsHeard: coverage.matched,
      passageWordsTotal: coverage.total,
      incomplete: coverage.incomplete,
      heard: result.silent ? '' : result.heard,
      silent: result.silent,
      keywords: score.words,
      matched: score.matched,
      total: score.total,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const failure = error instanceof SpeakCheckError ? error : new SpeakCheckError('Speaking check is unavailable. Try this passage again.');
    await closeSpeechLog(logId, failure.status === 429 ? 'rate_limited' : 'error', started, null, words.length, failure.status);
    return NextResponse.json({ error: failure.message }, {
      status: failure.status,
      headers: { 'Cache-Control': 'no-store', ...(failure.retryAfter ? { 'Retry-After': String(failure.retryAfter) } : {}) },
    });
  }
}
