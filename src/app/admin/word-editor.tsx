'use client';

import { useEffect, useRef, useState } from 'react';
import { useDialog } from '@/components/use-dialog';
import { Icon } from '@/components/icon';
import { readOverrides, saveOverrides } from '@/lib/core-sync';
import { getEntry, type WordEntry } from '@/lib/dictionary';
import { pronounce } from '@/lib/speech';
import { createBrowserSupabase } from '@/lib/supabase';
import { WORD_TYPES, resolveWord, type WordOverrides } from '@/lib/word-overrides';

type Added = NonNullable<WordOverrides['add']>[number];

function toList(text: string) {
  const items = text.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return items.length ? [...new Set(items)] : undefined;
}

export function WordEditor({
  lemma,
  word,
  onClose,
  onSaved,
}: {
  lemma: string;
  word: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [entry, setEntry] = useState<WordEntry | null | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [meaning, setMeaning] = useState('');
  const [added, setAdded] = useState<Added[]>([]);
  const [synonyms, setSynonyms] = useState('');
  const [antonyms, setAntonyms] = useState('');
  const [draft, setDraft] = useState<Added>({ pos: 'noun', text: '', example: '' });
  const [ta, setTa] = useState('');
  const [hi, setHi] = useState('');
  const initial = useRef<string | null>(null);
  const [discarding, setDiscarding] = useState(false);
  const keepEditing = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (discarding) keepEditing.current?.focus(); }, [discarding]);
  const current = JSON.stringify({ hidden: [...hidden].sort(), meaning, added, synonyms, antonyms, ta, hi, draft });
  useEffect(() => { if (loaded && initial.current === null) initial.current = current; }, [loaded, current]);
  const dirty = initial.current !== null && initial.current !== current;
  function requestClose() { if (saving) return; if (dirty) setDiscarding(true); else onClose(); }
  const dialog = useDialog<HTMLElement>(requestClose);
  useEffect(() => {
    function leave(event: BeforeUnloadEvent) { if (dirty) { event.preventDefault(); event.returnValue = ''; } }
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [dirty]);

  useEffect(() => {
    let live = true;
    setLoaded(false); setError(''); initial.current = null;
    void getEntry(lemma, { fresh: true }).then((e) => live && setEntry(e));
    readOverrides(createBrowserSupabase(), lemma)
      .then(({ overrides: o, translations }) => {
        if (!live) return;
        setTa(translations.ta ?? '');
        setHi(translations.hi ?? '');
        setHidden(new Set(o.hide ?? []));
        setMeaning(o.meaning ?? '');
        setAdded(o.add ?? []);
        setSynonyms(o.synonyms?.join(', ') ?? '');
        setAntonyms(o.antonyms?.join(', ') ?? '');
        setLoaded(true);
      })
      .catch((err: unknown) => live && setError(err instanceof Error ? err.message : 'Could not load this word.'));
    return () => {
      live = false;
    };
  }, [lemma, reload]);



  const overrides: WordOverrides = {
    meaning: meaning.trim() || undefined,
    hide: hidden.size ? [...hidden] : undefined,
    add: added.length ? added : undefined,
    synonyms: toList(synonyms),
    antonyms: toList(antonyms),
  };
  const preview = resolveWord(entry, overrides, { pos: null, meaning: null, synonym: null, antonym: null, examples: [] });

  async function save() {
    if (draft.text.trim() || draft.example?.trim()) { setError('Choose Add to include your new meaning before saving.'); return; }
    setSaving(true);
    setError('');
    try {
      await saveOverrides(createBrowserSupabase(), lemma, JSON.parse(JSON.stringify(overrides)) as WordOverrides, {
        ta: ta.trim() || null,
        hi: hi.trim() || null,
      });
      onSaved(`Saved changes for “${word}”.`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  function toggle(text: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  }

  return (
    <div className="drawer-backdrop" onClick={requestClose}>
      <aside
        ref={dialog}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="word-editor-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer-head">
          <div>
            <h2 id="word-editor-title">{word}</h2>
            <p className="meta">
              {entry?.phonetic ?? ''}
              {preview.types.length ? ` · ${preview.types.join(', ')}` : ''}
            </p>
          </div>
          <div className="drawer-head-actions">
            <button type="button" className="quiet icon-btn" aria-label={`Hear ${word}`} onClick={() => pronounce(word, entry?.phonetic)}>
              <Icon kind="sound" />
            </button>
            <button type="button" className="quiet icon-btn" aria-label="Close" onClick={requestClose}>
              <Icon kind="close" />
            </button>
          </div>
        </header>

        <fieldset className="drawer-body" disabled={!loaded || saving}>
          {!loaded && <p role="status">Loading saved word details…</p>}
          <section className="drawer-section">
            <label htmlFor="main-meaning">Main meaning (used in quizzes)</label>
            <textarea id="main-meaning"
              rows={2}
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder={preview.senses[0]?.definitions[0]?.text ?? 'Write a short, teen-friendly meaning'}
            />
            <p className="meta">Leave empty to use the first dictionary meaning that is shown.</p>
          </section>

          <section className="drawer-section two">
            <label>
              <span>Tamil meaning</span>
              <input lang="ta" value={ta} onChange={(e) => setTa(e.target.value)} placeholder="தமிழ் பொருள்" />
            </label>
            <label>
              <span>Hindi meaning</span>
              <input lang="hi" value={hi} onChange={(e) => setHi(e.target.value)} placeholder="हिन्दी अर्थ" />
            </label>
            <p className="meta">Shown to students who chose that language, in place of the automatic Microsoft Translator result. Leave empty to use the automatic one.</p>
          </section>

          <details className="drawer-section"><summary>Dictionary reference meanings</summary>
            
            {entry === undefined ? (
              <p className="meta">Looking up “{word}”…</p>
            ) : entry === null ? (
              <p className="meta">The dictionary could not be reached. Try again later.</p>
            ) : !entry.senses.length ? (
              <p className="meta">The dictionary has no meanings for this word. Add one below.</p>
            ) : (
              entry.senses.map((sense) => (
                <div key={sense.pos} className="sense-group">
                  <span className="pos-tag">{sense.pos}</span>
                  {sense.definitions.map((d) => (
                    <label key={d.text} className={`sense-row${hidden.has(d.text) ? ' off' : ''}`}>
                      <input type="checkbox" checked={!hidden.has(d.text)} onChange={() => toggle(d.text)} />
                      <span>
                        {d.text}
                        {d.example && <em>“{d.example}”</em>}
                      </span>
                    </label>
                  ))}
                </div>
              ))
            )}
            <p className="meta">Untick a meaning to hide it from students.</p>
          </details>

          <section className="drawer-section">
            <h3>Add a meaning</h3>
            {added.map((a, i) => (
              <div key={`${a.pos}-${a.text}`} className="added-row">
                <span className="pos-tag">{a.pos}</span>
                <span>
                  {a.text}
                  {a.example && <em>“{a.example}”</em>}
                </span>
                <button
                  type="button"
                  className="quiet icon-btn danger"
                  aria-label="Remove meaning"
                  onClick={() => setAdded(added.filter((_, j) => j !== i))}
                >
                  <Icon kind="trash" />
                </button>
              </div>
            ))}
            <div className="add-form">
              <select value={draft.pos} onChange={(e) => setDraft({ ...draft, pos: e.target.value })} aria-label="Word type">
                {WORD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} placeholder="Meaning" aria-label="Meaning" />
              <input
                value={draft.example ?? ''}
                onChange={(e) => setDraft({ ...draft, example: e.target.value })}
                placeholder="Example sentence (optional)"
                aria-label="Example sentence"
              />
              <button
                type="button"
                className="quiet"
                disabled={!draft.text.trim()}
                onClick={() => {
                  setAdded([...added, { pos: draft.pos, text: draft.text.trim(), example: draft.example?.trim() || undefined }]);
                  setDraft({ pos: draft.pos, text: '', example: '' });
                }}
              >
                Add
              </button>
            </div>
          </section>

          <section className="drawer-section two">
            <label>
              <span>Synonyms</span>
              <input
                value={synonyms}
                onChange={(e) => setSynonyms(e.target.value)}
                placeholder={entry?.synonyms.join(', ') || 'Comma-separated'}
              />
            </label>
            <label>
              <span>Antonyms</span>
              <input
                value={antonyms}
                onChange={(e) => setAntonyms(e.target.value)}
                placeholder={entry?.antonyms.join(', ') || 'Comma-separated'}
              />
            </label>
            <p className="meta">Leave empty to use the online lists shown as placeholders.</p>
          </section>
        <details className="drawer-section student-preview"><summary>Preview what students see</summary><h3>{word}</h3><p>{preview.primary || 'Add a main meaning to preview this word.'}</p>{ta && <p lang="ta">{ta}</p>}{hi && <p lang="hi">{hi}</p>}<p>{preview.synonyms.join(' · ')}</p></details>
        </fieldset>
        <footer className="drawer-foot">
          {discarding && <div className="discard-notice" role="alert"><strong>Discard unsaved changes?</strong><p>Your edits have not been saved.</p><button ref={keepEditing} type="button" onClick={() => setDiscarding(false)}>Keep editing</button><button type="button" className="danger" onClick={onClose}>Discard changes</button></div>}
          {error && (
            <p className="drawer-error" role="alert">
              {error}
              {!loaded && <button type="button" onClick={() => setReload(n => n + 1)}>Retry loading</button>}
            </p>
          )}
          <button type="button" className="quiet" onClick={requestClose}>
            Cancel
          </button>
          <button type="button" className="go" onClick={() => void save()} disabled={saving || !loaded || !dirty}>
            {!loaded ? 'Loading…' : saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
