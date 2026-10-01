'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../icon';
import type { StudyWord } from '@/lib/learner';
import { suggestLocal, suggestOnline, type WordSuggest } from '@/lib/word-lookup';

function markMatch(text: string, query: string) {
  const q = query.trim();
  const at = text.toLowerCase().indexOf(q.toLowerCase());
  if (!q || at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <b>{text.slice(at, at + q.length)}</b>
      {text.slice(at + q.length)}
    </>
  );
}

export function WordSearch({
  words,
  busy,
  error,
  onFind,
  compact = false,
}: {
  words: StudyWord[];
  busy: boolean;
  error: string;
  onFind: (query: string) => void;
  compact?: boolean;
}) {
  const listId = useId();
  const box = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [extra, setExtra] = useState<WordSuggest[]>([]);

  const local = useMemo(() => suggestLocal(query, words), [query, words]);
  const have = useMemo(() => new Set(local.map((h) => h.lemma)), [local]);
  const hints = useMemo(() => {
    const seen = new Set(have);
    const out = [...local];
    for (const row of extra) {
      if (seen.has(row.lemma)) continue;
      seen.add(row.lemma);
      out.push(row);
      if (out.length >= 8) break;
    }
    return out;
  }, [local, extra, have]);

  useEffect(() => {
    const q = query.trim();
    setExtra([]);
    if (q.length < 2) return;
    const ac = new AbortController();
    const t = window.setTimeout(() => {
      void suggestOnline(q, have, ac.signal).then((rows) => {
        if (!ac.signal.aborted) setExtra(rows);
      });
    }, 180);
    return () => {
      window.clearTimeout(t);
      ac.abort();
    };
  }, [query, have]);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, []);

  function find(raw: string) {
    const next = raw.trim();
    if (next.length < 2) return;
    setQuery(next);
    setOpen(false);
    onFind(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!hints.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % hints.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i - 1 + hints.length) % hints.length);
    } else if (event.key === 'Enter' && open && hints[active]) {
      event.preventDefault();
      find(hints[active].word);
    }
  }

  const show = open && hints.length > 0 && !busy;

  return (
    <form
      ref={box}
      className={`word-search${compact ? ' compact' : ''}${show ? ' open' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        find(query);
      }}
    >
      <div className="word-search-field">
        <Icon kind="search" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Look up a word"
          aria-label="Look up a word"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={show}
          aria-activedescendant={show && hints[active] ? `${listId}-${hints[active].lemma}` : undefined}
          role="combobox"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className="s-btn primary" disabled={busy || query.trim().length < 2} aria-label={busy ? 'Searching' : 'Search'}>
          {compact ? <Icon kind="search" /> : busy ? 'Searching…' : 'Search'}
        </button>
      </div>
      {show && (
        <ul id={listId} className="word-suggest" role="listbox">
          {hints.map((hint, i) => (
            <li key={hint.lemma} role="presentation">
              <button
                id={`${listId}-${hint.lemma}`}
                type="button"
                role="option"
                aria-selected={i === active}
                className={i === active ? 'on' : undefined}
                onMouseEnter={() => setActive(i)}
                onClick={() => find(hint.word)}
              >
                <Icon kind="search" />
                <span>{markMatch(hint.word, query)}</span>
                {!hint.inRepo && <em>web</em>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="word-search-error" role="status">
          {error}
        </p>
      )}
    </form>
  );
}
