export const SPEECH_STATUSES = ['running', 'ok', 'silent', 'error', 'capped', 'rate_limited'] as const;
export type SpeechStatus = (typeof SPEECH_STATUSES)[number];

export type SpeechUsageRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  school: string;
  classLabel: string;
  startedAt: string;
  finishedAt: string | null;
  model: string;
  provider: string;
  status: SpeechStatus;
  audioBytes: number;
  audioMs: number;
  latencyMs: number | null;
  level: string;
  matched: number | null;
  total: number | null;
  httpStatus: number | null;
};

export type SpeechWindow = { requests: number; users: number; audioMs: number; peakUsers: number; peakChecks: number };
export type SpeechHour = { start: string; requests: number; users: number; audioMs: number; peakUsers: number };
export type SpeechPerson = {
  userId: string;
  name: string;
  email: string;
  school: string;
  classLabel: string;
  checks: number;
  audioMs: number;
  groqLimits: number;
  appLimits: number;
  errors: number;
  lastAt: string;
};
export type SpeechRecent = SpeechUsageRow;

export type SpeechReport = {
  configuredModel: string;
  provider: string;
  generatedAt: string;
  liveUsers: number;
  liveChecks: number;
  hour: SpeechWindow;
  day: SpeechWindow;
  week: SpeechWindow;
  month: SpeechWindow;
  outcomes: Record<Exclude<SpeechStatus, 'running'>, number>;
  latencyMs: { average: number; p95: number };
  hours: SpeechHour[];
  people: SpeechPerson[];
  recent: SpeechRecent[];
};

const LIVE_MS = 60_000;
const OPEN_MS = 45_000;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type Span = { start: number; end: number; userId: string };

function spanOf(row: SpeechUsageRow, now: number): Span {
  const start = Date.parse(row.startedAt);
  const live = row.status === 'running' && now - start < LIVE_MS;
  const finished = row.finishedAt ? Date.parse(row.finishedAt) : NaN;
  const end = live ? now : Number.isFinite(finished) ? finished : start + OPEN_MS;
  return { start, end: Math.max(end, start), userId: row.userId };
}

function peak(spans: Span[], from: number, to: number) {
  const events: { t: number; userId: string; delta: number }[] = [];
  for (const span of spans) {
    const start = Math.max(span.start, from);
    const end = Math.min(span.end, to);
    if (end <= start) continue;
    events.push({ t: start, userId: span.userId, delta: 1 });
    events.push({ t: end, userId: span.userId, delta: -1 });
  }
  events.sort((a, b) => a.t - b.t || a.delta - b.delta);
  const active = new Map<string, number>();
  let checks = 0;
  let peakUsers = 0;
  let peakChecks = 0;
  for (const event of events) {
    const count = (active.get(event.userId) ?? 0) + event.delta;
    if (count <= 0) active.delete(event.userId);
    else active.set(event.userId, count);
    checks += event.delta;
    if (event.delta > 0) {
      peakUsers = Math.max(peakUsers, active.size);
      peakChecks = Math.max(peakChecks, checks);
    }
  }
  return { peakUsers, peakChecks };
}

function windowOf(rows: SpeechUsageRow[], spans: Span[], now: number, length: number): SpeechWindow {
  const from = now - length;
  const inside = rows.filter((row) => {
    const at = Date.parse(row.startedAt);
    return row.status !== 'running' && at >= from && at <= now;
  });
  const users = new Set(inside.map((row) => row.userId));
  const audioMs = inside.reduce((sum, row) => sum + (row.status === 'ok' || row.status === 'silent' || row.status === 'error' ? row.audioMs : 0), 0);
  const tops = peak(spans, from, now);
  return { requests: inside.length, users: users.size, audioMs, peakUsers: tops.peakUsers, peakChecks: tops.peakChecks };
}

function localParts(ms: number, tzOffsetMin: number) {
  const shifted = new Date(ms + tzOffsetMin * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
  };
}

/** Turn the stored checks into the figures Super Admin uses to judge a paid speech plan. */
export function summarizeSpeechUsage(rows: SpeechUsageRow[], now: number, tzOffsetMin: number, configuredModel: string): SpeechReport {
  const spans = rows.map((row) => spanOf(row, now));
  const live = rows.filter((row) => row.status === 'running' && now - Date.parse(row.startedAt) < LIVE_MS);
  const finished = rows.filter((row) => row.status !== 'running');
  const monthFrom = now - 30 * DAY;
  const outcomes: SpeechReport['outcomes'] = { ok: 0, silent: 0, error: 0, capped: 0, rate_limited: 0 };
  for (const row of finished) {
    if (Date.parse(row.startedAt) < monthFrom) continue;
    outcomes[row.status as keyof typeof outcomes] += 1;
  }
  const waits = finished
    .filter((row) => row.latencyMs != null && Date.parse(row.startedAt) >= now - 7 * DAY && (row.status === 'ok' || row.status === 'silent' || row.status === 'error'))
    .map((row) => row.latencyMs ?? 0)
    .sort((a, b) => a - b);
  const average = waits.length ? Math.round(waits.reduce((sum, value) => sum + value, 0) / waits.length) : 0;
  const p95 = waits.length ? waits[Math.min(waits.length - 1, Math.ceil(waits.length * 0.95) - 1)] : 0;

  const here = localParts(now, tzOffsetMin);
  const dayStartUtc = Date.UTC(here.year, here.month, here.day, here.hour) - tzOffsetMin * 60_000 - here.hour * HOUR;
  const hours: SpeechHour[] = [];
  for (let index = 23; index >= 0; index -= 1) {
    const start = dayStartUtc + (here.hour - index) * HOUR;
    const end = start + HOUR;
    const bucket = finished.filter((row) => {
      const at = Date.parse(row.startedAt);
      return at >= start && at < end;
    });
    hours.push({
      start: new Date(start).toISOString(),
      requests: bucket.length,
      users: new Set(bucket.map((row) => row.userId)).size,
      audioMs: bucket.reduce((sum, row) => sum + (row.status === 'ok' || row.status === 'silent' || row.status === 'error' ? row.audioMs : 0), 0),
      peakUsers: peak(spans, start, end).peakUsers,
    });
  }

  const people = new Map<string, SpeechPerson>();
  for (const row of finished) {
    if (Date.parse(row.startedAt) < monthFrom) continue;
    const current = people.get(row.userId) ?? {
      userId: row.userId,
      name: row.name,
      email: row.email,
      school: row.school,
      classLabel: row.classLabel,
      checks: 0,
      audioMs: 0,
      groqLimits: 0,
      appLimits: 0,
      errors: 0,
      lastAt: row.startedAt,
    };
    current.checks += 1;
    if (row.status === 'ok' || row.status === 'silent' || row.status === 'error') current.audioMs += row.audioMs;
    if (row.status === 'rate_limited') current.groqLimits += 1;
    if (row.status === 'capped') current.appLimits += 1;
    if (row.status === 'error') current.errors += 1;
    if (Date.parse(row.startedAt) > Date.parse(current.lastAt)) current.lastAt = row.startedAt;
    if (row.school) current.school = row.school;
    if (row.classLabel) current.classLabel = row.classLabel;
    people.set(row.userId, current);
  }

  return {
    configuredModel,
    provider: 'groq',
    generatedAt: new Date(now).toISOString(),
    liveUsers: new Set(live.map((row) => row.userId)).size,
    liveChecks: live.length,
    hour: windowOf(rows, spans, now, HOUR),
    day: windowOf(rows, spans, now, DAY),
    week: windowOf(rows, spans, now, 7 * DAY),
    month: windowOf(rows, spans, now, 30 * DAY),
    outcomes,
    latencyMs: { average, p95 },
    hours,
    people: [...people.values()].sort((a, b) => b.checks - a.checks || a.name.localeCompare(b.name)),
    recent: [...rows].sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt)).slice(0, 60),
  };
}

export function mapSpeechRow(raw: Record<string, unknown>): SpeechUsageRow | null {
  const status = typeof raw.status === 'string' ? raw.status : '';
  if (!SPEECH_STATUSES.includes(status as SpeechStatus)) return null;
  if (typeof raw.id !== 'string' || typeof raw.user_id !== 'string' || typeof raw.started_at !== 'string') return null;
  return {
    id: raw.id,
    userId: raw.user_id,
    name: typeof raw.student_name === 'string' && raw.student_name ? raw.student_name : 'Student',
    email: typeof raw.email === 'string' ? raw.email : '',
    school: typeof raw.school === 'string' ? raw.school : '',
    classLabel: typeof raw.class_label === 'string' ? raw.class_label : '',
    startedAt: raw.started_at,
    finishedAt: typeof raw.finished_at === 'string' ? raw.finished_at : null,
    model: typeof raw.model === 'string' ? raw.model : 'whisper-large-v3',
    provider: typeof raw.provider === 'string' ? raw.provider : 'groq',
    status: status as SpeechStatus,
    audioBytes: Number(raw.audio_bytes) || 0,
    audioMs: Number(raw.audio_ms) || 0,
    latencyMs: raw.latency_ms == null ? null : Number(raw.latency_ms),
    level: typeof raw.level_key === 'string' ? raw.level_key : 'beginner',
    matched: raw.matched == null ? null : Number(raw.matched),
    total: raw.keyword_total == null ? null : Number(raw.keyword_total),
    httpStatus: raw.http_status == null ? null : Number(raw.http_status),
  };
}
