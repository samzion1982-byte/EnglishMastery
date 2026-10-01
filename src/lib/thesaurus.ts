export const THESAURI = [
  'webster',
  'thesauruscom',
  'wordhippo',
  'cambridge-th',
  'oxford',
  'cambridge',
  'collins',
  'longman',
  'webster-dict',
  'wiktionary',
  'wikipedia',
] as const;
export type ThesaurusId = (typeof THESAURI)[number];
export const REF_GROUPS = ['Thesaurus', 'Dictionary', 'Pictures'] as const;
export type RefGroup = (typeof REF_GROUPS)[number];

type Ref = { id: ThesaurusId; group: RefGroup; label: string; note: string; path: (q: string) => string };

export const THESAURUS_META: Ref[] = [
  { id: 'webster', group: 'Thesaurus', label: 'Merriam-Webster Thesaurus', note: 'American thesaurus', path: (q) => `https://www.merriam-webster.com/thesaurus/${q}` },
  { id: 'thesauruscom', group: 'Thesaurus', label: 'Thesaurus.com', note: 'Synonyms and antonyms', path: (q) => `https://www.thesaurus.com/browse/${q}` },
  { id: 'wordhippo', group: 'Thesaurus', label: 'WordHippo', note: 'Another word for, opposites', path: (q) => `https://www.wordhippo.com/what-is/another-word-for/${q}.html` },
  { id: 'cambridge-th', group: 'Thesaurus', label: 'Cambridge Thesaurus', note: 'Learner thesaurus', path: (q) => `https://dictionary.cambridge.org/thesaurus/${q}` },
  { id: 'oxford', group: 'Dictionary', label: "Oxford Learner's Dictionary", note: 'British learner dictionary', path: (q) => `https://www.oxfordlearnersdictionaries.com/definition/english/${q}` },
  { id: 'cambridge', group: 'Dictionary', label: 'Cambridge Dictionary', note: 'Learner dictionary', path: (q) => `https://dictionary.cambridge.org/dictionary/english/${q}` },
  { id: 'collins', group: 'Dictionary', label: 'Collins Dictionary', note: 'Definitions and synonyms', path: (q) => `https://www.collinsdictionary.com/dictionary/english/${q}` },
  { id: 'longman', group: 'Dictionary', label: 'Longman Dictionary', note: 'Learner dictionary', path: (q) => `https://www.ldoceonline.com/dictionary/${q}` },
  { id: 'webster-dict', group: 'Dictionary', label: 'Merriam-Webster Dictionary', note: 'American dictionary', path: (q) => `https://www.merriam-webster.com/dictionary/${q}` },
  { id: 'wiktionary', group: 'Dictionary', label: 'Wiktionary', note: 'Free dictionary', path: (q) => `https://en.wiktionary.org/wiki/${q}` },
  {
    id: 'wikipedia',
    group: 'Pictures',
    label: 'Wikipedia',
    note: 'A photo and a short article — useful when you need to see what a word like pelmet looks like',
    path: (q) => `https://en.wikipedia.org/wiki/${q}`,
  },
];

const PICTURE_ALIASES = new Set([
  'pictionary',
  'commons',
  'pixabay',
  'picture-dict',
  'langeek',
  'wordsmyth',
  'oxford-pic',
  'wikipedia',
]);

export function asThesaurus(value: unknown): ThesaurusId {
  if (typeof value === 'string' && PICTURE_ALIASES.has(value)) return 'wikipedia';
  return THESAURI.includes(value as ThesaurusId) ? (value as ThesaurusId) : 'webster';
}

function refOf(id: ThesaurusId) {
  return THESAURUS_META.find((r) => r.id === id) ?? THESAURUS_META[0];
}

export function thesaurusUrl(id: ThesaurusId, lemma: string) {
  if (id === 'wikipedia') {
    const title = lemma
      .trim()
      .replace(/\s+/g, '_')
      .replace(/^./, (c) => c.toUpperCase());
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  }
  return refOf(id).path(encodeURIComponent(lemma));
}

export function thesaurusTitle(id: ThesaurusId) {
  return `Open ${refOf(id).label}`;
}
