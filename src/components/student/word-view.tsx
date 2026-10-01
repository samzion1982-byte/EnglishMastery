'use client';

import { useEffect, useState } from 'react';
import { Icon } from '../icon';
import type { Language, StudyWord } from '@/lib/learner';
import { motherTongueOf } from '@/lib/mother-tongue';
import { dictate, stopDictate, speakWord, type DictateTick } from '@/lib/speech';
import type { ResolvedWord } from '@/lib/word-overrides';
import { thesaurusUrl, type ThesaurusId } from '@/lib/thesaurus';
import { rememberTongue, savedTongue } from '@/lib/word-store';

const typeClass = (pos: string) => `type-chip type-${pos.replace(/[^a-z]/g, '')}`;

const LANGUAGE_NAMES: Record<Exclude<Language, 'en'>, string> = { ta: 'தமிழ்', hi: 'हिन्दी', ml: 'മലയാളം', te: 'తెలుగు', kn: 'ಕನ್ನಡ', fr: 'Français' };

export function TypeChips({ types }: { types: string[] }) {
  if (!types.length) return null;
  return (
    <span className="type-chips">
      {types.map((t) => (
        <span key={t} className={typeClass(t)}>
          {t}
        </span>
      ))}
    </span>
  );
}

/**
 * The teacher's meaning first, then the translation the admin queue saved, and a live lookup only for words the
 * queue has not reached. Waits for the saved data to load so a saved translation is never looked up again.
 */
function useMotherTongue(word: StudyWord, language: Language, ready: boolean) {
  const teacher = language === 'ta' ? word.ta : language === 'hi' ? word.hi : null;
  const stored = ready && !teacher ? savedTongue(word.lemma, language) : undefined;
  const key = `${language}:${word.lemma}`;
  const [live, setLive] = useState<{ key: string; text: string | null } | null>(null);
  useEffect(() => {
    if (language === 'en' || teacher || !ready || stored) return;
    let active = true;
    void motherTongueOf(word.lemma, language).then((text) => {
      if (active) {
        rememberTongue(word.lemma, language, text);
        setLive({ key, text });
      }
    });
    return () => {
      active = false;
    };
  }, [key, language, teacher, ready, stored, word.lemma]);
  const textOf = (text: string | null) => (language === 'ta' && word.lemma.toLowerCase() === 'petrichor' ? 'மண்வாசனை' : text);
  if (language === 'en') return { text: null, loading: false, auto: false };
  if (teacher) return { text: textOf(teacher), loading: false, auto: false };
  if (stored) return { text: textOf(stored), loading: false, auto: true };
  const current = ready && live?.key === key ? live : null;
  return { text: textOf(current?.text ?? null), loading: !current, auto: true };
}

export function WordHead({
  word,
  resolved,
  auto,
  language,
  showTongue,
  thesaurus = 'webster',
}: {
  word: StudyWord;
  resolved: ResolvedWord;
  auto?: boolean;
  language: Language;
  showTongue?: boolean;
  thesaurus?: ThesaurusId;
}) {
  const tongue = useMotherTongue(word, language, showTongue !== false);
  const [say, setSay] = useState<DictateTick | null>(null);

  function hear() {
    dictate(word.word, setSay, resolved.phonetic);
  }

  useEffect(() => {
    setSay(null);
    if (auto) dictate(word.word, setSay, resolved.phonetic);
    return () => stopDictate();
  }, [word.word, auto, resolved.phonetic]);

  const show = showTongue !== false && language !== 'en' && (tongue.text || tongue.loading);
  const parts = say?.parts ?? [];
  const split = parts.length > 1;

  return (
    <div className="word-head">
      <div className="word-line">
        <h1 className="big-word">
          <a
            className={`word-link${split ? ' say-word' : ''}${say?.phase === 'whole' || say?.phase === 'done' ? ' whole' : ''}`}
            href={thesaurusUrl(thesaurus, word.lemma)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {split
              ? parts.map((part, i) => (
                  <span
                    key={`${part}-${i}`}
                    className={`say-part${say?.phase === 'part' && say.at === i ? ' now' : ''}${
                      say && (say.phase !== 'part' || say.at > i) ? ' said' : ''
                    }`}
                  >
                    {part}
                  </span>
                ))
              : word.word}
          </a>
          <button type="button" className="speak-btn" aria-label={`Hear ${word.word} in parts`} onClick={hear}>
            <Icon kind="sound" />
          </button>
        </h1>
        {show && (
          <div className={`tongue-stack${tongue.loading ? ' loading' : ''}`} lang={language} title={tongue.auto ? 'Microsoft Translator' : undefined}>
            <span className="tongue-lang">{LANGUAGE_NAMES[language]}</span>
            <p className="tongue-inline">
              <strong className="tongue-word" lang={language}>{tongue.text ?? '…'}</strong>
              {tongue.text && (
                <button
                  type="button"
                  className="speak-btn sm"
                  aria-label={`Hear ${tongue.text} in ${LANGUAGE_NAMES[language]}`}
                  onClick={() => speakWord(tongue.text as string, language)}
                >
                  <Icon kind="sound" />
                </button>
              )}
            </p>
          </div>
        )}
      </div>
      <p className="word-sub">
        {resolved.phonetic && <span className="phonetic">{resolved.phonetic}</span>}
        <TypeChips types={resolved.types} />
      </p>
    </div>
  );
}

function escapeRe(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wordPattern(word: string, lemma: string) {
  const extra = [word, lemma, `${lemma}s`, `${lemma}es`, `${lemma}ed`, `${lemma}d`, `${lemma}ing`];
  if (lemma.endsWith('e')) extra.push(`${lemma.slice(0, -1)}ing`);
  if (lemma.endsWith('y')) extra.push(`${lemma.slice(0, -1)}ies`, `${lemma.slice(0, -1)}ied`);
  const forms = [...new Set(extra.map((w) => w.trim()).filter(Boolean))].sort((a, b) => b.length - a.length);
  return new RegExp(`\\b(${forms.map(escapeRe).join('|')})\\b`, 'gi');
}

function surfaceForm(lemma: string, pos: string) {
  const word = lemma.toLowerCase();
  const kind = pos.toLowerCase();
  if (kind.startsWith('adverb')) {
    if (word.endsWith('y') && !word.endsWith('ly')) return `${word.slice(0, -1)}ily`;
    return `${word}ly`;
  }
  if (kind.startsWith('noun')) {
    if (word.endsWith('y')) return `${word.slice(0, -1)}iness`;
    return `${word}ness`;
  }
  return word;
}

function formLabel(lemma: string, pos: string, example: string | null) {
  const guess = surfaceForm(lemma, pos);
  if (example && new RegExp(`\\b${escapeRe(guess)}\\b`, 'i').test(example)) return guess;
  return lemma;
}

function HighlightedSentence({ text, word, lemma }: { text: string; word: string; lemma: string }) {
  const pattern = wordPattern(word, lemma);
  const nodes: Array<string | { mark: string; at: number }> = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;
    if (at > last) nodes.push(text.slice(last, at));
    nodes.push({ mark: match[0], at });
    last = at + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return (
    <>
      {nodes.map((part, i) =>
        typeof part === 'string' ? (
          <span key={i}>{part}</span>
        ) : (
          <em key={i} className="use-word">
            {part.mark}
          </em>
        ),
      )}
    </>
  );
}

/** Meaning, sentences, other senses and related words. Mother tongue sits on the word line. */
export function WordReveal({
  word,
  resolved,
  loading,
}: {
  word: StudyWord;
  resolved: ResolvedWord;
  language: Language;
  loading: boolean;
}) {
  const gist = resolved.gist;
  const full = resolved.primary;
  const showFull = !!full && (!gist.length || full.replace(/[.!]$/, '').toLowerCase() !== gist[0].toLowerCase());
  const others = resolved.senses
    .map((s) => ({ ...s, definitions: s.definitions.filter((d) => d.text !== full) }))
    .filter((s) => s.definitions.length);
  const related = resolved.synonyms.length > 0 || resolved.antonyms.length > 0;
  const spare = resolved.examples.filter(Boolean);
  let spareAt = 0;
  const uses = resolved.senses
    .map((sense) => {
      const definition = sense.definitions.find((item) => item.example) ?? sense.definitions[0];
      if (!definition) return null;
      const example = definition.example ?? spare[spareAt++] ?? null;
      if (!example) return null;
      return {
        pos: sense.pos,
        form: formLabel(word.lemma, sense.pos, example),
        example,
      };
    })
    .filter((item): item is { pos: string; form: string; example: string } => !!item)
    .slice(0, 3);

  return (
    <div className="reveal learn-sheet">
      <section className="meaning-box">
        <div className="meaning-copy">
          {gist.length > 0 ? (
            <p className="gist">{gist.join(' · ')}</p>
          ) : (
            <p className="gist long">{full ?? (loading ? 'Looking up the meaning…' : 'No meaning found yet. Ask your teacher.')}</p>
          )}
          {gist.length > 0 && showFull && <p className="gist-full">{full}</p>}
        </div>
        {others.length > 0 && (
          <div className="also-in">
            <h3>Also means</h3>
            <ul className="also">
              {others.flatMap((s) =>
                s.definitions.map((d) => (
                  <li key={d.text}>
                    {s.pos !== 'meaning' && <span className={typeClass(s.pos)}>{s.pos}</span>}
                    {d.text}
                  </li>
                )),
              )}
            </ul>
          </div>
        )}
      </section>

      {uses.length > 0 && (
        <section className="reveal-block used-as">
          <h3>Used as</h3>
          <ul className="used-list">
            {uses.map((use) => (
              <li key={`${use.pos}-${use.form}`}>
                <p className="used-form">
                  <span className={typeClass(use.pos)}>{use.pos}</span>
                </p>
                {use.example && (
                  <p className="used-example">
                    <HighlightedSentence text={use.example} word={use.form} lemma={word.lemma} />
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {related && (
        <aside className="learn-notes">
            <div className="rel-bar">
              {resolved.synonyms.length > 0 && (
                <div className="rel-row">
                  <b>Similar</b>
                  <ul className="rel-pills">
                    {resolved.synonyms.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {resolved.antonyms.length > 0 && (
                <div className="rel-row opposite">
                  <b>Opposite</b>
                  <span className="rel-words-plain">{resolved.antonyms.join(', ')}</span>
                </div>
              )}
            </div>
        </aside>
      )}
    </div>
  );
}
