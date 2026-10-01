import { NextResponse } from 'next/server';
import { SentenceCheckError, suggestSentences } from '@/lib/sentence-ai';
import { getSessionRole } from '@/lib/supabase-server';
import { frameReview, textUsesWord } from '@/lib/practice';

export async function POST(request: Request) {
  const { user, active } = await getSessionRole();
  if (!user || !active) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.text !== 'string' || !body.text.trim() || body.text.length > 500 || typeof body.word !== 'string' || !body.word.trim() || body.word.length > 80 || !['en-GB', 'en-US'].includes(body.language ?? 'en-GB')) {
    return NextResponse.json({ error: 'Send a sentence of up to 500 characters and a target word.' }, { status: 400 });
  }
  const text = body.text.trim();
  const word = body.word.trim();
  if (!textUsesWord(text, word)) {
    return NextResponse.json({ ok: false, matches: [], original: text, message: `Include “${word}” in your sentence.` }, { headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    const [suggestion] = await suggestSentences(body.language ?? 'en-GB', [{ word, text }]);
    const review = frameReview(text, suggestion);
    if (review.ok) {
      return NextResponse.json({ ok: true, matches: [], original: text, message: 'No change suggested.' }, { headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json({
      ok: false,
      original: text,
      message: review.reason,
      matches: [{ message: 'Suggested sentences', offset: 0, length: text.length, replacements: review.corrections, rule: 'suggestion' }],
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const failure = error instanceof SentenceCheckError ? error : new SentenceCheckError('Writing suggestions are unavailable. Your writing has not been graded.');
    return NextResponse.json({ error: failure.message, message: failure.message }, { status: failure.status, headers: { 'Cache-Control': 'no-store', ...(failure.retryAfter ? { 'Retry-After': String(failure.retryAfter) } : {}) } });
  }
}
