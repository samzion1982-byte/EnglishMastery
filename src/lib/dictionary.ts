export type Definition = { text: string; example: string | null };
export type Sense = { pos: string; definitions: Definition[] };

export type WordEntry = {
  found: boolean;
  phonetic: string | null;
  audio: string | null;
  senses: Sense[];
  synonyms: string[];
  antonyms: string[];
  /** Extra sentences using the word, beyond the per-meaning examples. */
  examples: string[];
  /** One to three short, common words that sum up the main meaning, e.g. accurate: exact, true. */
  gist: string[];
};

type DictEntry = {
  phonetic?: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings?: {
    partOfSpeech?: string;
    synonyms?: string[];
    antonyms?: string[];
    definitions?: { definition?: string; example?: string; synonyms?: string[]; antonyms?: string[] }[];
  }[];
};

const PER_TYPE = 3;
const RELATED = 6;
const TTL = 7 * 86_400_000;
const EXAMPLES = 5;
const CACHE_PREFIX = 'em-dict-v5:';
/** Words per million in Datamuse's corpus; above this a word is common enough to explain another. */
const COMMON = 8;
const memory = new Map<string, Promise<WordEntry | null>>();
/** Set after the Free Dictionary API fails, so lookups in the next few minutes don't wait for it. */
let dictionaryDownUntil = 0;
/** Set after Wiktionary asks us to slow down. Storage lookups wait this out instead of failing the batch. */
let wikiCooldownUntil = 0;

/** How long the enrich queue should wait before the next batch, in seconds. */
export function enrichRetryIn() {
  const wait = wikiCooldownUntil - Date.now();
  if (wait <= 0) return 3;
  return Math.min(12, Math.max(2, Math.ceil(wait / 1000)));
}

function pacer(limit: number, gapMs: number) {
  let active = 0;
  let lastStart = 0;
  const queue: Array<() => void> = [];
  function kick() {
    while (active < limit && queue.length) {
      const wait = Math.max(0, lastStart + gapMs - Date.now());
      if (wait > 0) {
        setTimeout(kick, wait);
        return;
      }
      lastStart = Date.now();
      active += 1;
      queue.shift()!();
    }
  }
  return function pace<T>(task: () => Promise<T>) {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        task().then(resolve, reject).finally(() => {
          active -= 1;
          kick();
        });
      });
      kick();
    });
  };
}

/** Wiktionary rejects a crowd. Two at a time, and a 429 pauses everyone before the next call. */
const paceWiki = pacer(2, 400);
/** Datamuse allows a higher rate than Wiktionary, but still rejects a sudden pile of calls. */
const paceMuse = pacer(8, 40);
const onServer = typeof window === 'undefined';
/** Wikimedia asks automated clients to identify themselves; browsers send their own User-Agent. */
const WIKI_HEADERS: HeadersInit | undefined = onServer ? { 'User-Agent': 'EnglishMastery/1.0 (vocabulary app for students)' } : undefined;

function sentence(text: string) {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (!clean) return '';
  const cap = clean.charAt(0).toUpperCase() + clean.slice(1);
  return /[.!?]$/.test(cap) ? cap : `${cap}.`;
}

function related(list: string[], lemma: string) {
  const seen = new Set<string>([lemma]);
  const out: string[] = [];
  for (const raw of list) {
    const word = raw.trim().toLowerCase();
    if (!word || word.split(' ').length > 2 || seen.has(word)) continue;
    seen.add(word);
    out.push(word);
    if (out.length === RELATED) break;
  }
  return out;
}

const TYPE_NAMES: Record<string, string> = { n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb' };
const KEEP_TYPES = new Set([
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'interjection',
  'determiner',
  'article',
  'numeral',
  'participle',
]);
/** Senses a teenager should not be taught as the meaning of a word. */
const SKIP_LABEL = /\b(obsolete|archaic|dated|rare|slang|vulgar|offensive|derogatory|ethnic slur|historical|dialect(al)?|nonstandard|pejorative|euphemistic|sexual)\b/i;
const FORM_OF = /\b(alternative (form|spelling)|misspelling|obsolete (form|spelling)|archaic (form|spelling)|abbreviation|initialism|acronym|plural|past tense|past participle|present participle|third-person singular|comparative|superlative|simple past)( form)? of\b/i;

function stripHtml(html: string) {
  return html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')
    .replace(/<(ol|ul|dl)[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Removes a leading "(label, label)" and reports whether it marks a sense to skip. */
function cleanDefinition(raw: string) {
  let text = raw.trim();
  const label = text.match(/^\(([^)]*)\)\s*/);
  if (label) {
    if (SKIP_LABEL.test(label[1])) return null;
    text = text.slice(label[0].length);
  }
  if (!text || /^(a|an) (surname|place name|unincorporated community|city|town|river|village)\b/i.test(text)) return null;
  if (FORM_OF.test(text)) {
    const gloss = raw.match(/\[([^[\]]{12,})\]/);
    const inner = gloss?.[1]?.trim();
    if (!inner || FORM_OF.test(inner) || SKIP_LABEL.test(inner)) return null;
    return sentence(inner);
  }
  return sentence(text);
}

function addSense(byType: Map<string, Definition[]>, pos: string, text: string | null, example: string | null) {
  if (!text || !KEEP_TYPES.has(pos)) return;
  const list = byType.get(pos) ?? [];
  if (list.length >= PER_TYPE || list.some((d) => d.text === text)) return;
  list.push({ text, example });
  byType.set(pos, list);
}

/** Sentences not suitable for a 12–17 audience. */
const UNSAFE = /\b(sex\w*|kill\w*|murder\w*|suicide|drunk\w*|beer|wine|vodka|whisky|drugs?|cocaine|gun|guns|shot|rape\w*|naked|nude|hell|damn|bitch|bastard|porn\w*|terroris\w*|bomb\w*|prostitut\w*|dead|die|died|corpse|blood\w*)\b/i;

/** Regular inflections of a word, used to check that a sentence really contains it. */
function formsOf(lemma: string) {
  const forms = new Set([lemma, `${lemma}s`, `${lemma}es`, `${lemma}ed`, `${lemma}d`, `${lemma}ing`, `${lemma}er`, `${lemma}est`, `${lemma}ly`]);
  if (lemma.endsWith('e')) forms.add(`${lemma.slice(0, -1)}ing`);
  if (lemma.endsWith('y')) {
    const stem = lemma.slice(0, -1);
    ['ies', 'ied', 'ier', 'iest', 'ily'].forEach((s) => forms.add(stem + s));
  }
  const last = lemma.at(-1) ?? '';
  if (/[bdgklmnprt]/.test(last)) ['ed', 'ing', 'er', 'est'].forEach((s) => forms.add(lemma + last + s));
  return forms;
}

function usesWord(text: string, forms: Set<string>) {
  return text
    .toLowerCase()
    .split(/[^a-z'-]+/)
    .some((w) => forms.has(w));
}

function goodExample(text: string, forms: Set<string>) {
  return text.length >= 20 && text.length <= 150 && usesWord(text, forms) && !UNSAFE.test(text);
}

type WiktSense = { partOfSpeech?: string; definitions?: { definition?: string; examples?: string[] }[] };

export type WikiTiming = { queueMs: number; cooldownMs: number; httpMs: number; status: number | 'error' };

async function fetchWiktionary(lemma: string, timing?: WikiTiming) {
  const queued = Date.now();
  if (Date.now() < wikiCooldownUntil) {
    if (timing) {
      timing.queueMs = 0;
      timing.cooldownMs = wikiCooldownUntil - Date.now();
      timing.httpMs = 0;
      timing.status = 429;
    }
    throw new Error('Wiktionary cooling down');
  }
  return paceWiki(async () => {
  const started = Date.now();
  const title = lemma.trim().replace(/\s+/g, '_');
  const httpStart = Date.now();
  let res: Response;
  try {
    res = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(title)}`, {
      headers: WIKI_HEADERS,
      signal: AbortSignal.timeout(6000),
    });
  } catch (err) {
    if (timing) {
      timing.queueMs = started - queued;
      timing.cooldownMs = Math.max(0, httpStart - started);
      timing.httpMs = Date.now() - httpStart;
      timing.status = 'error';
    }
    throw err;
  }
  if (timing) {
    timing.queueMs = started - queued;
    timing.cooldownMs = Math.max(0, httpStart - started);
    timing.httpMs = Date.now() - httpStart;
    timing.status = res.status;
  }
  if (res.status === 404) return { byType: new Map<string, Definition[]>(), extra: [] as string[] };
  if (res.status === 429 || res.status === 503) {
    const retryAfter = Number(res.headers.get('retry-after'));
    const pauseMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2500;
    wikiCooldownUntil = Date.now() + Math.min(pauseMs, 12_000);
    throw new Error(`Wiktionary returned ${res.status}`);
  }
  if (!res.ok) throw new Error(`Wiktionary returned ${res.status}`);
  const data = (await res.json()) as { en?: WiktSense[] };
  const byType = new Map<string, Definition[]>();
  const forms = formsOf(lemma);
  const extra: string[] = [];
  // A word type seen again starts a new etymology, whose senses are usually rarer:
  // the first etymology gives up to two senses per type; later ones may add one sense to an existing type.
  let etymology = 0;
  let seen = new Set<string>();
  for (const sense of data.en ?? []) {
    const pos = (sense.partOfSpeech || '').toLowerCase();
    if (!KEEP_TYPES.has(pos)) continue;
    if (seen.has(pos)) {
      etymology += 1;
      seen = new Set();
    }
    seen.add(pos);
    if (etymology > 0 && !byType.has(pos)) continue;
    const before = byType.get(pos)?.length ?? 0;
    const allowed = etymology === 0 ? 2 : before + 1;
    const defs = sense.definitions ?? [];
    const texts = defs.map((d) => cleanDefinition(stripHtml(d.definition ?? '')));
    for (let i = 0; i < defs.length; i++) {
      if ((byType.get(pos)?.length ?? 0) >= Math.min(allowed, PER_TYPE)) break;
      // Parent senses carry their sub-senses' text; cut where the next sense begins.
      let text = texts[i];
      const next = texts[i + 1];
      const cut = text && next && next.length > 12 ? text.indexOf(next.slice(0, 40)) : -1;
      if (text && cut > 12) text = text.slice(0, cut).trim();
      const found = (defs[i].examples ?? []).map(stripHtml).filter((e) => e.length > 8 && e.length < 180);
      const example = found[0] ?? null;
      addSense(byType, pos, text, example ? sentence(example) : null);
      if (text) extra.push(...found.slice(1).filter((e) => goodExample(e, forms)).map(sentence));
    }
  }
  return { byType, extra };
  });
}

type TatoebaRow = { text?: string };

/** Everyday sentences from Tatoeba (CC BY 2.0 FR), 6–16 words long. */
async function fetchTatoeba(lemma: string) {
  const res = await fetch(
    `https://api.tatoeba.org/unstable/sentences?lang=eng&q=${encodeURIComponent(lemma)}&word_count=6-16&sort=random&limit=20&showtrans=none`,
    { signal: AbortSignal.timeout(6000) },
  );
  if (!res.ok) throw new Error(`Tatoeba returned ${res.status}`);
  const forms = formsOf(lemma);
  const rows = ((await res.json()) as { data?: TatoebaRow[] }).data ?? [];
  return rows.map((r) => (r.text ?? '').trim()).filter((t) => goodExample(t, forms));
}

type MuseRow = { word?: string; defs?: string[]; tags?: string[] };

async function fetchDatamuseWord(lemma: string) {
  return paceMuse(() => fetchDatamuseWordNow(lemma));
}

function parseDatamuseWord(lemma: string, rows: MuseRow[]) {
  const row = rows.find((r) => r.word?.toLowerCase() === lemma);
  const byType = new Map<string, Definition[]>();
  for (const def of row?.defs ?? []) {
    const [code, text = ''] = def.split('\t');
    addSense(byType, TYPE_NAMES[code] ?? code, cleanDefinition(text), null);
  }
  const ipa = row?.tags?.find((t) => t.startsWith('ipa_pron:'))?.slice(9).trim();
  return { byType, phonetic: ipa ? `/${ipa.replace(/ɫ/g, 'l')}/` : null };
}

async function fetchDatamuseWordNow(lemma: string) {
  const res = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(lemma)}&md=dr&ipa=1&max=1`, {
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`Datamuse returned ${res.status}`);
  return parseDatamuseWord(lemma, (await res.json()) as MuseRow[]);
}

/** Optional extra: recorded audio, examples and related words. Often slow or unreachable, so it never blocks. */
async function fetchDictionary(lemma: string): Promise<(Omit<WordEntry, 'synonyms' | 'antonyms' | 'examples' | 'gist'> & { syn: string[]; ant: string[] }) | 'missing'> {
  if (Date.now() < dictionaryDownUntil) throw new Error('Dictionary unavailable');
  let res: Response;
  try {
    res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(lemma)}`, {
      signal: AbortSignal.timeout(2500),
    });
  } catch (err) {
    dictionaryDownUntil = Date.now() + 10 * 60_000;
    throw err;
  }
  if (res.status === 404) return 'missing';
  if (!res.ok) throw new Error(`Dictionary returned ${res.status}`);
  const entries = (await res.json()) as DictEntry[];

  const byType = new Map<string, Definition[]>();
  const syn: string[] = [];
  const ant: string[] = [];
  for (const entry of entries) {
    for (const m of entry.meanings ?? []) {
      const pos = (m.partOfSpeech || 'other').toLowerCase();
      const list = byType.get(pos) ?? [];
      for (const d of m.definitions ?? []) {
        const text = d.definition ? sentence(d.definition) : '';
        if (text && list.length < PER_TYPE && !list.some((x) => x.text === text)) {
          list.push({ text, example: d.example ? sentence(d.example) : null });
        }
        syn.push(...(d.synonyms ?? []));
        ant.push(...(d.antonyms ?? []));
      }
      syn.push(...(m.synonyms ?? []));
      ant.push(...(m.antonyms ?? []));
      byType.set(pos, list);
    }
  }

  const phonetics = entries.flatMap((e) => e.phonetics ?? []);
  const audio =
    phonetics.find((p) => p.audio && /-(uk|gb)\.mp3$/i.test(p.audio))?.audio ||
    phonetics.find((p) => p.audio)?.audio ||
    null;
  return {
    found: true,
    phonetic: entries.find((e) => e.phonetic)?.phonetic || phonetics.find((p) => p.text)?.text || null,
    audio,
    senses: [...byType.entries()].filter(([, d]) => d.length).map(([pos, definitions]) => ({ pos, definitions })),
    syn,
    ant,
  };
}

async function fetchDatamuse(lemma: string, rel: 'rel_syn' | 'rel_ant') {
  try {
    const res = await paceMuse(() =>
      fetch(`https://api.datamuse.com/words?${rel}=${encodeURIComponent(lemma)}&max=12`, {
        signal: AbortSignal.timeout(6000),
      }),
    );
    if (!res.ok) return [];
    return ((await res.json()) as { word?: string }[]).map((r) => r.word ?? '');
  } catch {
    return [];
  }
}

/**
 * Direct antonyms first. Many verbs (achieve, succeed) have none, so we also take antonyms of close synonyms.
 */
export async function antonymsFor(lemma: string, synonyms: string[] = []) {
  const direct = await fetchDatamuse(lemma, 'rel_ant');
  if (direct.length) return related(direct, lemma);
  const extras: string[] = [];
  for (const syn of synonyms.slice(0, 3)) {
    extras.push(...(await fetchDatamuse(syn, 'rel_ant')));
    if (extras.length >= RELATED) break;
  }
  return related(extras, lemma);
}

type MeansLike = { word: string; f: number };

async function fetchMeansLike(lemma: string): Promise<MeansLike[]> {
  try {
    const res = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(lemma)}&md=f&max=20`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    return ((await res.json()) as { word?: string; tags?: string[] }[]).map((r) => ({
      word: (r.word ?? '').toLowerCase(),
      f: Number(r.tags?.find((t) => t.startsWith('f:'))?.slice(2) ?? 0),
    }));
  } catch {
    return [];
  }
}

/** Short phrases inside a definition: "Telling the truth; exact; not faulty." gives exact, not faulty. */
function shortParts(definition: string) {
  return definition
    .replace(/\([^)]*\)/g, '')
    .replace(/[.!]$/, '')
    .split(/[;,:]/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => {
      const n = s.split(/\s+/).length;
      return s && n <= 3 && !/^(of|in|as|or|and|the|a|an|with|for|by|at|from|such|especially|usually|often|e\.g)\b/.test(s);
    });
}

/**
 * Short glosses from the definition itself come first, the most common first. Only when the definition has none
 * do we borrow common "means like" words, and only ones that are also listed synonyms or appear in the definition.
 */
function gistOf(lemma: string, definition: string | undefined, meansLike: MeansLike[], synonyms: string[]) {
  const freq = new Map(meansLike.map((m) => [m.word, m.f]));
  const bare = (s: string) => s.replace(/^to /, '');
  const parts = definition ? shortParts(definition) : [];
  const out: string[] = [];
  const add = (s: string) => {
    if (out.length < 3 && !out.includes(s) && !s.includes(lemma)) out.push(s);
  };
  const known = parts.filter((p) => freq.has(bare(p))).sort((a, b) => (freq.get(bare(b)) ?? 0) - (freq.get(bare(a)) ?? 0));
  [...known, ...parts.filter((p) => !known.includes(p) && p.split(/\s+/).length <= 2)].forEach(add);
  if (out.length) return out;

  const syn = new Set(synonyms.map((s) => s.toLowerCase()));
  const text = ` ${(definition ?? '').toLowerCase()} `;
  for (const m of meansLike) {
    if (out.length >= 2) break;
    if (m.f >= COMMON && m.word.split(' ').length <= 2 && (syn.has(m.word) || text.includes(` ${m.word} `))) add(m.word);
  }
  return out;
}

function readCache(lemma: string): WordEntry | null {
  if (onServer) return null;
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_PREFIX + lemma) || 'null') as { t: number; e: WordEntry } | null;
    if (raw && Date.now() - raw.t < TTL) return raw.e;
  } catch {}
  return null;
}

function writeCache(lemma: string, entry: WordEntry) {
  if (onServer) return;
  try {
    localStorage.setItem(CACHE_PREFIX + lemma, JSON.stringify({ t: Date.now(), e: entry }));
  } catch {}
}

async function load(lemma: string, fresh: boolean, strict = false): Promise<WordEntry | null> {
  if (!fresh) {
    const cached = readCache(lemma);
    if (cached) return cached;
  }
  const settle = <T,>(p: Promise<T>) => p.then((v) => ({ ok: true as const, v })).catch(() => ({ ok: false as const }));
  // Saving thousands of words skips the slow optional sources (audio, Tatoeba, "means like").
  // Wiktionary still supplies meanings and examples; Datamuse supplies pronunciation and related words.
  const [wikt, muse, dict, syn, ant, tatoeba, meansLike] = await Promise.all([
    settle(fetchWiktionary(lemma)),
    settle(fetchDatamuseWord(lemma)),
    strict ? Promise.resolve({ ok: false as const }) : settle(fetchDictionary(lemma)),
    fetchDatamuse(lemma, 'rel_syn'),
    fetchDatamuse(lemma, 'rel_ant'),
    strict ? Promise.resolve({ ok: false as const }) : settle(fetchTatoeba(lemma)),
    strict ? Promise.resolve([] as MeansLike[]) : fetchMeansLike(lemma),
  ]);
  if (!wikt.ok && !muse.ok && !dict.ok) return null;
  if (strict && !wikt.ok) return null;

  const extra = dict.ok && dict.v !== 'missing' ? dict.v : null;
  const bySource = [wikt.ok ? wikt.v.byType : null, extra ? new Map(extra.senses.map((s) => [s.pos, s.definitions])) : null, muse.ok ? muse.v.byType : null];
  const primary = bySource.find((m) => m && m.size) ?? new Map<string, Definition[]>();

  // Fill in missing examples from other sources that share the same definition text.
  const examples = new Map<string, string>();
  for (const m of bySource) for (const defs of m?.values() ?? []) for (const d of defs) if (d.example) examples.set(d.text, d.example);
  const senses: Sense[] = [...primary.entries()].map(([pos, defs]) => ({
    pos,
    definitions: defs.map((d) => ({ text: d.text, example: d.example ?? examples.get(d.text) ?? null })),
  }));

  const synonyms = related([...(extra?.syn ?? []), ...syn], lemma);
  const antonyms = related([...(extra?.ant ?? []), ...ant], lemma);
  const entry: WordEntry = {
    found: senses.length > 0,
    phonetic: extra?.phonetic ?? (muse.ok ? muse.v.phonetic : null),
    audio: extra?.audio ?? null,
    senses,
    synonyms,
    antonyms: antonyms.length || strict ? antonyms : await antonymsFor(lemma, synonyms),
    examples: [],
    gist: gistOf(lemma, senses[0]?.definitions[0]?.text, meansLike, synonyms),
  };
  const used = new Set(senses.flatMap((s) => s.definitions.map((d) => d.example?.toLowerCase())));
  for (const ex of [...(tatoeba.ok ? tatoeba.v : []), ...(wikt.ok ? wikt.v.extra : [])]) {
    if (entry.examples.length === EXAMPLES) break;
    if (used.has(ex.toLowerCase())) continue;
    used.add(ex.toLowerCase());
    entry.examples.push(ex);
  }
  writeCache(lemma, entry);
  return entry;
}

/** Short meaning for a phrase the word dictionaries do not list, from the Wikipedia summary. */
export async function wikiPhraseMeaning(phrase: string): Promise<string | null> {
  const title = phrase.trim().replace(/\s+/g, '_');
  if (title.length < 2) return null;
  let res: Response;
  try {
    res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const data = (await res.json()) as { type?: string; description?: string; extract?: string };
  if (data.type === 'disambiguation') return null;
  const description = data.description?.replace(/\s+/g, ' ').trim() ?? '';
  if (description.length >= 12 && description.split(/\s+/).length >= 2 && !/wikimedia|disambiguation/i.test(description)) {
    return sentence(description);
  }
  const first = (data.extract ?? '').replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s/)[0] ?? '';
  if (first.length < 20 || /may refer to/i.test(first)) return null;
  return first.length > 200 ? `${first.slice(0, 197).trim()}…` : first;
}

/**
 * Meanings and word types from Wiktionary (Datamuse as backup), synonyms and antonyms from Datamuse,
 * extra example sentences from Tatoeba, and recorded audio from the Free Dictionary API when it responds.
 * Returns null when the services are unreachable; `found: false` when the dictionary has no entry.
 */
export function getEntry(lemma: string, { fresh = false }: { fresh?: boolean } = {}) {
  const key = lemma.toLowerCase();
  if (fresh) memory.delete(key);
  let pending = memory.get(key);
  if (!pending) {
    pending = load(key, fresh);
    memory.set(key, pending);
    void pending.then((e) => {
      if (!e) memory.delete(key);
    });
  }
  return pending;
}

/**
 * One Datamuse call per word for the admin queue. Wiktionary answered in about 2s but rejected most of the
 * batch with 429, and those words then sat in our queue. Datamuse supplies the meaning; Wiktionary is only
 * the backup when Datamuse has no entry. Returns null when neither answers.
 */
export async function lookupForStorage(lemma: string, timing?: WikiTiming): Promise<WordEntry | null> {
  const key = lemma.toLowerCase();
  const queued = Date.now();
  let muse: { byType: Map<string, Definition[]>; phonetic: string | null } | null = null;
  try {
    muse = await paceMuse(async () => {
      const started = Date.now();
      const httpStart = Date.now();
      const res = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(key)}&md=dr&ipa=1&max=1`, {
        signal: AbortSignal.timeout(6000),
      });
      if (timing) {
        timing.queueMs = started - queued;
        timing.cooldownMs = 0;
        timing.httpMs = Date.now() - httpStart;
        timing.status = res.status;
      }
      if (res.status === 429 || res.status === 503) throw new Error(`Datamuse returned ${res.status}`);
      if (!res.ok) throw new Error(`Datamuse returned ${res.status}`);
      return parseDatamuseWord(key, (await res.json()) as MuseRow[]);
    });
  } catch {
    if (timing && (timing.status === 429 || timing.status === 503)) return null;
    muse = null;
  }
  if (muse && muse.byType.size) {
    const senses: Sense[] = [...muse.byType.entries()].map(([pos, defs]) => ({
      pos,
      definitions: defs.map((d) => ({ text: d.text, example: d.example })),
    }));
    return {
      found: true,
      phonetic: muse.phonetic,
      audio: null,
      senses,
      synonyms: [],
      antonyms: [],
      examples: [],
      gist: gistOf(key, senses[0]?.definitions[0]?.text, [], []),
    };
  }
  return wiktionaryEntry(key, timing);
}

async function wiktionaryEntry(lemma: string, timing?: WikiTiming): Promise<WordEntry | null> {
  let wikt: { byType: Map<string, Definition[]>; extra: string[] };
  try {
    wikt = await fetchWiktionary(lemma, timing);
  } catch {
    return null;
  }
  const senses: Sense[] = [...wikt.byType.entries()].map(([pos, defs]) => ({
    pos,
    definitions: defs.map((d) => ({ text: d.text, example: d.example })),
  }));
  const entry: WordEntry = {
    found: senses.length > 0,
    phonetic: null,
    audio: null,
    senses,
    synonyms: [],
    antonyms: [],
    examples: [],
    gist: gistOf(lemma, senses[0]?.definitions[0]?.text, [], []),
  };
  const used = new Set(senses.flatMap((s) => s.definitions.map((d) => d.example?.toLowerCase())));
  for (const ex of wikt.extra) {
    if (entry.examples.length === EXAMPLES) break;
    if (used.has(ex.toLowerCase())) continue;
    used.add(ex.toLowerCase());
    entry.examples.push(ex);
  }
  return entry;
}

export async function prefetchEntries(lemmas: string[], limit = 6) {
  const out = new Map<string, WordEntry | null>();
  const queue = [...new Set(lemmas.map((l) => l.toLowerCase()))];
  async function worker() {
    for (let lemma = queue.shift(); lemma; lemma = queue.shift()) out.set(lemma, await getEntry(lemma));
  }
  await Promise.all(Array.from({ length: Math.min(limit, queue.length) }, worker));
  return out;
}
