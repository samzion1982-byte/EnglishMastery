import { NextResponse } from 'next/server';
import { SentenceCheckError, suggestSentences } from '@/lib/sentence-ai';
import { getSessionRole } from '@/lib/supabase-server';
import { frameReview, passageUsesFullStops, textUsesWord, type PracticeMark } from '@/lib/practice';
import type { LanguageToolMatch } from '@/lib/languagetool-public';

export async function POST(request: Request) {
  const { user, active } = await getSessionRole();
  if (!user || !active) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || !['sentences', 'story'].includes(body.mode) || !Array.isArray(body.words) || body.words.length < 1 || body.words.length > 10 || !body.words.every((w: { word?: unknown }) => w && typeof w.word === 'string' && w.word.trim() && w.word.length <= 80) || typeof body.story !== 'string' || body.story.length > 4000 || !Array.isArray(body.sentences) || body.sentences.length > 10 || !body.sentences.every((s: { word?: unknown; text?: unknown }) => s && typeof s.word === 'string' && typeof s.text === 'string' && s.text.length <= 500) || !['en-GB', 'en-US'].includes(body.language ?? 'en-GB') || (body.skipped !== undefined && (!Array.isArray(body.skipped) || body.skipped.length > 10 || !body.skipped.every((s: unknown) => typeof s === 'string')))) {
    return NextResponse.json({ error: 'Invalid practice input.' }, { status: 400 });
  }
  const words = body.words.map((w: { word: string }) => w.word.trim()) as string[];
  if (new Set(words.map((w) => w.toLowerCase())).size !== words.length) return NextResponse.json({ error: 'Duplicate words.' }, { status: 400 });
  const language = (body.language ?? 'en-GB') as 'en-GB' | 'en-US';
  const skipped = new Set<string>(body.skipped ?? []);
  try {
    if (body.mode === 'story') {
      const story = body.story.trim();
      if (!story) return NextResponse.json({ error: 'Write your story first.' }, { status: 400 });
      const [suggestion] = await suggestSentences(language, [{ word: words.join(', '), text: story }]);
      const storyReview = frameReview(story, suggestion, true);
      if (!storyReview.ok || !passageUsesFullStops(story)) {
        return NextResponse.json({ error: 'Review your story before submitting.', reviews: [{ word: 'Your story', original: story, message: storyReview.reason || 'End each sentence with a full stop.', matches: [{ message: 'Suggested sentences', offset: 0, length: story.length, replacements: storyReview.corrections, rule: 'suggestion' }] }] }, { status: 422 });
      }
      const notes = words.map((word) => {
        const used = textUsesWord(story, word);
        return { word, ok: used, teach: used ? 'Used in the story. No change suggested.' : 'Target word not used.', original: story, matches: [] as LanguageToolMatch[] };
      });
      if (notes.some((note) => !note.ok)) {
        return NextResponse.json({ error: 'Use every pool word in the story.', reviews: notes.filter((note) => !note.ok).map((note) => ({ ...note, message: note.teach })) }, { status: 422 });
      }
      const mark: PracticeMark = { score: notes.filter((note) => note.ok).length, max: words.length, summary: 'Suggestions can be mistaken. No change suggested does not prove the meaning is the one you intended.', notes };
      return NextResponse.json(mark, { headers: { 'Cache-Control': 'no-store' } });
    }
    const rows = words.map((word) => ({ word, text: (body.sentences.find((s: { word: string }) => s.word.trim() === word)?.text ?? '').trim(), skipped: skipped.has(word) }));
    const pending = rows.filter((row) => !row.skipped && row.text && textUsesWord(row.text, row.word));
    const suggestions = pending.length ? await suggestSentences(language, pending.map((row) => ({ word: row.word, text: row.text }))) : [];
    const byWord = new Map(pending.map((row, index) => [row.word, suggestions[index]]));
    const notes = rows.map((row) => {
      if (row.skipped || !row.text) return { word: row.word, ok: false, teach: 'Skipped — not graded.', original: row.text, matches: [] as LanguageToolMatch[] };
      if (!textUsesWord(row.text, row.word)) return { word: row.word, ok: false, teach: `Include “${row.word}” in your sentence.`, original: row.text, matches: [] as LanguageToolMatch[] };
      const suggestion = byWord.get(row.word);
      const review = suggestion ? frameReview(row.text, suggestion) : { ok: false, corrections: [] as string[], reason: 'Include a sentence.' };
      if (review.ok) return { word: row.word, ok: true, teach: 'No change suggested.', original: row.text, matches: [] as LanguageToolMatch[] };
      return { word: row.word, ok: false, teach: review.reason, original: row.text, matches: [{ message: 'Suggested sentences', offset: 0, length: row.text.length, replacements: review.corrections, rule: 'suggestion' }] };
    });
    const reviews = notes.filter((note) => !note.ok && !note.teach.startsWith('Skipped')).map((note) => ({ ...note, message: note.teach }));
    if (reviews.length) return NextResponse.json({ error: 'Revise or skip these sentences before submitting.', reviews }, { status: 422 });
    const mark: PracticeMark = { score: notes.filter((note) => note.ok).length, max: words.length, summary: 'Suggestions can be mistaken. Skipped sentences are not graded.', notes };
    return NextResponse.json(mark, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const failure = error instanceof SentenceCheckError ? error : new SentenceCheckError('Writing suggestions are unavailable. No result has been assigned.');
    return NextResponse.json({ error: failure.message }, { status: failure.status, headers: { 'Cache-Control': 'no-store', ...(failure.retryAfter ? { 'Retry-After': String(failure.retryAfter) } : {}) } });
  }
}
