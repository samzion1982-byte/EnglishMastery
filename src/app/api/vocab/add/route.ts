import { NextResponse } from 'next/server';
import { canAddCoreWords } from '@/lib/access';
import { classifyLemma } from '@/lib/classify';
import type { WordEntry } from '@/lib/dictionary';
import { loadRoleGrants } from '@/lib/grants';
import { createServerSupabase, getSessionRole } from '@/lib/supabase-server';
import { displayWord, lemmaOf, liveBuckets, type LiveBucket } from '@/lib/vocab';

function asBucket(value: unknown): LiveBucket | null {
  return liveBuckets.includes(value as LiveBucket) ? (value as LiveBucket) : null;
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && !!v.trim()) : [];
}

export async function POST(request: Request) {
  const { user, role, active } = await getSessionRole();
  const sb = await createServerSupabase();
  const grants = role && !canAddCoreWords(role) ? await loadRoleGrants(sb, role) : {};
  if (!user || !active || !canAddCoreWords(role, grants)) {
    return NextResponse.json({ error: 'You do not have permission to add words.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const lemma = lemmaOf(typeof body.lemma === 'string' ? body.lemma : typeof body.word === 'string' ? body.word : '');
  const word = displayWord(typeof body.word === 'string' ? body.word : lemma);
  if (lemma.length < 2) return NextResponse.json({ error: 'That is not a word we can add.' }, { status: 400 });

  const bucket = asBucket(body.bucket) ?? classifyLemma(word).bucket;
  const pos = typeof body.pos === 'string' && body.pos.trim() ? body.pos.trim() : null;
  const meaning = typeof body.meaning === 'string' && body.meaning.trim() ? body.meaning.trim() : null;
  const synonym = typeof body.synonym === 'string' && body.synonym.trim() ? body.synonym.trim() : null;
  const antonym = typeof body.antonym === 'string' && body.antonym.trim() ? body.antonym.trim() : null;
  const examples = strings(body.examples).slice(0, 8);
  const entry = body.entry && typeof body.entry === 'object' ? (body.entry as WordEntry) : null;
  const now = new Date().toISOString();

  const row = {
    lemma,
    display_word: word,
    bucket,
    status: 'published',
    list_order: Date.now(),
    part_of_speech: pos,
    meaning,
    synonym,
    antonym,
    examples,
    distractors: [],
    is_new: true,
    classified_by: 'human',
    published_at: now,
    ...(entry?.found
      ? {
          enrichment: entry,
          enriched_at: now,
        }
      : {}),
  };

  type Saved = { id: string; lemma: string; display_word: string; bucket: LiveBucket };
  const write = (payload: Record<string, unknown>) =>
    sb.from('core_words').upsert(payload, { onConflict: 'lemma' }).select('id, lemma, display_word, bucket').maybeSingle();
  const first = await write(row);
  let saved = (first.data ?? null) as Saved | null;
  if (first.error && /enrichment|enriched_at/.test(first.error.message)) {
    const { enrichment: _e, enriched_at: _t, ...basic } = row;
    const retry = await write(basic);
    if (retry.error) return NextResponse.json({ error: retry.error.message }, { status: 500 });
    saved = (retry.data ?? null) as Saved | null;
  } else if (first.error) {
    return NextResponse.json({ error: first.error.message }, { status: 500 });
  }
  if (!saved) return NextResponse.json({ error: 'The word could not be saved.' }, { status: 500 });

  return NextResponse.json({
    word: {
      id: saved.id,
      word: saved.display_word,
      lemma: saved.lemma,
      bucket: saved.bucket,
      pos,
      meaning,
      ta: null,
      hi: null,
      synonym,
      antonym,
      examples,
      distractors: [],
      overrides: {},
    },
  });
}
