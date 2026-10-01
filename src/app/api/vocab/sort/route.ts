import { NextResponse } from 'next/server';
import { availableAiProvider, sortWordsWithAi } from '@/lib/ai-sort';
import { isAdminStaff } from '@/lib/access';
import { getSessionRole } from '@/lib/supabase-server';

export async function GET() {
  const { user, role, active } = await getSessionRole();
  if (!user || !active || !isAdminStaff(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ provider: availableAiProvider() });
}

export async function POST(request: Request) {
  const { user, role, active } = await getSessionRole();
  if (!user || !active || !isAdminStaff(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { words?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const words = Array.isArray(body.words) ? body.words.filter((w): w is string => typeof w === 'string') : [];
  if (!words.length) return NextResponse.json({ error: 'No words' }, { status: 400 });
  if (words.length > 5000) return NextResponse.json({ error: 'Max 5000 words per request' }, { status: 400 });

  const result = await sortWordsWithAi(words);
  return NextResponse.json(result);
}
