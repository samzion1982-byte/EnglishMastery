'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../icon';
import { wikiPhraseMeaning } from '@/lib/dictionary';
import { entryFor } from '@/lib/word-store';
import { resolveWord } from '@/lib/word-overrides';
import {
  appendixLookupKeys,
  fetchAppendixCategories,
  fetchAppendixItems,
  pathOf,
  subtreeIds,
  treeOf,
  type AppendixCategory,
  type AppendixItem,
  type AppendixNode,
} from '@/lib/appendix';
import { readAppendixBriefs, readAppendixCatalog, writeAppendixBrief, writeAppendixCatalog } from '@/lib/appendix-cache';
import type { Language, StudyWord } from '@/lib/learner';
import type { ThesaurusId } from '@/lib/thesaurus';
import { WordLook } from './word-look';

type Brief = { gist: string | null };
type Anchor = { top: number; height: number; left: number; right: number };
type Peek = {
  item: AppendixItem;
  pinned: boolean;
  top: number;
  left: number;
  side: 'right' | 'left';
  anchor: Anchor;
  loading: boolean;
} & Brief;

function studyWordOf(item: AppendixItem): StudyWord {
  return {
    id: item.id,
    word: item.displayWord,
    lemma: item.lemma,
    bucket: 'intermediate',
    pos: null,
    meaning: null,
    ta: null,
    hi: null,
    synonym: null,
    antonym: null,
    examples: [],
    distractors: [],
    overrides: {},
  };
}

function roll(node: AppendixNode, direct: Map<string, number>): number {
  return (direct.get(node.id) ?? 0) + node.children.reduce((sum, child) => sum + roll(child, direct), 0);
}

function filterTree(nodes: AppendixNode[], query: string): AppendixNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;
  const out: AppendixNode[] = [];
  for (const node of nodes) {
    const children = filterTree(node.children, query);
    if (node.name.toLowerCase().includes(q)) out.push(node);
    else if (children.length) out.push({ ...node, children });
  }
  return out;
}

function readAnchor(el: HTMLElement): Anchor {
  const rect = el.getBoundingClientRect();
  return { top: rect.top, height: rect.height, left: rect.left, right: rect.right };
}

function placeBeside(anchor: Anchor, box: { width: number; height: number }) {
  const gap = 36;
  const edge = 8;
  const roomRight = window.innerWidth - anchor.right - edge;
  const side: 'right' | 'left' = roomRight >= box.width + gap ? 'right' : 'left';
  let left = side === 'right' ? anchor.right + gap : anchor.left - box.width - gap;
  left = Math.max(edge, Math.min(left, window.innerWidth - box.width - edge));
  let top = anchor.top + anchor.height / 2 - box.height / 2;
  top = Math.max(edge, Math.min(top, window.innerHeight - box.height - edge));
  return { top: Math.round(top), left: Math.round(left), side };
}

export function AppendixBrowser({ language, thesaurus }: { language: Language; thesaurus: ThesaurusId }) {
  const [categories, setCategories] = useState<AppendixCategory[]>([]);
  const [items, setItems] = useState<AppendixItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [topicQuery, setTopicQuery] = useState('');
  const [wordQuery, setWordQuery] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [navOpen, setNavOpen] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [peek, setPeek] = useState<Peek | null>(null);
  const [study, setStudy] = useState<AppendixItem | null>(null);
  const cache = useRef(new Map<string, Brief>());
  const request = useRef(0);
  const card = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  function applyCatalog(visible: AppendixCategory[], published: AppendixItem[]) {
    setCategories(visible);
    setItems(published);
    const first = visible.find((row) => !row.parentId)?.id ?? null;
    setSelected((current) => (current && visible.some((row) => row.id === current) ? current : first));
    setOpen((current) => {
      const keep = [...current].filter((id) => visible.some((row) => row.id === id));
      return new Set(keep.length ? keep : first ? [first] : []);
    });
  }

  function load() {
    setError('');
    void (async () => {
      const cached = await readAppendixCatalog();
      if (cached) {
        applyCatalog(cached.categories.filter((row) => row.enabled), cached.items.filter((item) => item.status === 'published'));
        setLoading(false);
      } else {
        setLoading(true);
      }
      try {
        const [nextCategories, nextItems] = await Promise.all([fetchAppendixCategories(), fetchAppendixItems()]);
        const visible = nextCategories.filter((row) => row.enabled);
        const published = nextItems.filter((item) => item.status === 'published');
        applyCatalog(visible, published);
        void writeAppendixCatalog({ categories: visible, items: published });
      } catch (err: unknown) {
        if (!cached) setError(err instanceof Error ? err.message : 'The appendix could not be loaded.');
      } finally {
        setLoading(false);
      }
    })();
  }

  useEffect(() => {
    load();
    void readAppendixBriefs().then((saved) => {
      for (const [lemma, gist] of saved) cache.current.set(lemma, { gist });
    });
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 860px)');
    const apply = () => setNarrow(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  useLayoutEffect(() => {
    const node = card.current;
    if (!peek || !node) return;
    const next = placeBeside(peek.anchor, { width: node.offsetWidth, height: node.offsetHeight });
    if (Math.abs(next.top - peek.top) < 1 && Math.abs(next.left - peek.left) < 1 && next.side === peek.side) return;
    setPeek((current) => (current && current.item.id === peek.item.id ? { ...current, ...next } : current));
  }, [peek]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [wordQuery]);

  useEffect(() => {
    if (!peek?.pinned) return;
    function onDown(event: PointerEvent) {
      if (card.current?.contains(event.target as Node)) return;
      setPeek(null);
    }
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [peek?.pinned]);

  const tree = useMemo(() => filterTree(treeOf(categories), topicQuery), [categories, topicQuery]);
  const direct = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
    return counts;
  }, [items]);

  const selectedPath = selected ? pathOf(categories, selected) : [];
  const selectedNode = selectedPath.at(-1) ?? null;
  const scope = useMemo(() => (selected ? subtreeIds(categories, selected) : new Set<string>()), [categories, selected]);
  const query = wordQuery.trim().toLowerCase();
  const visibleItems = useMemo(() => {
    const pool = query ? items : items.filter((item) => scope.has(item.categoryId));
    return pool
      .filter((item) => !query || item.displayWord.toLowerCase().includes(query) || item.lemma.includes(query))
      .sort((a, b) => a.displayWord.localeCompare(b.displayWord) || a.sortOrder - b.sortOrder);
  }, [items, scope, query]);

  const grouped = useMemo(() => {
    const buckets = new Map<string, AppendixItem[]>();
    for (const item of visibleItems) {
      const path = pathOf(categories, item.categoryId);
      const at = !query && selected ? path.findIndex((row) => row.id === selected) : -1;
      const group = query ? item.categoryId : path[at + 1]?.id ?? item.categoryId;
      const list = buckets.get(group) ?? [];
      list.push(item);
      buckets.set(group, list);
    }
    const hasChildren = categories.some((row) => row.parentId === selected);
    if (!query && !hasChildren) return [{ id: selected ?? 'all', label: '', items: visibleItems }];
    return [...buckets.entries()]
      .map(([id, rows]) => ({
        id,
        label: query
          ? pathOf(categories, id).map((row) => row.name).join(' · ')
          : categories.find((row) => row.id === id)?.name ?? '',
        items: rows,
      }))
      .sort((a, b) => a.label.localeCompare(b.label) || a.id.localeCompare(b.id));
  }, [visibleItems, categories, selected, query]);

  function choose(id: string) {
    setSelected(id);
    setWordQuery('');
    setPeek(null);
    if (narrow) setNavOpen(false);
    setOpen((current) => {
      const next = new Set(current);
      for (const row of pathOf(categories, id)) next.add(row.id);
      return next;
    });
  }

  async function showPeek(item: AppendixItem, anchor: HTMLElement, pinned: boolean) {
    const known = cache.current.get(item.lemma);
    const spot = readAnchor(anchor);
    const place = placeBeside(spot, { width: 260, height: 104 });
    setPeek({ item, pinned, ...place, anchor: spot, loading: !known, gist: known?.gist ?? null });
    if (known) return;
    const token = ++request.current;
    let brief: Brief = { gist: null };
    try {
      for (const key of appendixLookupKeys(item.lemma)) {
        const entry = await entryFor(key);
        const resolved = resolveWord(entry, {}, { pos: null, meaning: null, synonym: null, antonym: null, examples: [] });
        const text = resolved.primary || resolved.gist.join(' · ');
        if (text) {
          brief = { gist: text };
          break;
        }
      }
      if (!brief.gist) {
        for (const key of appendixLookupKeys(item.displayWord.toLowerCase())) {
          const wiki = await wikiPhraseMeaning(key);
          if (wiki) {
            brief = { gist: wiki };
            break;
          }
        }
      }
    } catch {
      if (token !== request.current) return;
      setPeek((current) => (current && current.item.id === item.id ? { ...current, loading: false, gist: null } : current));
      return;
    }
    cache.current.set(item.lemma, brief);
    if (brief.gist) void writeAppendixBrief(item.lemma, brief.gist);
    if (token !== request.current) return;
    setPeek((current) => (current && current.item.id === item.id ? { ...current, ...brief, loading: false } : current));
  }

  function hidePeek() {
    setPeek((current) => (current?.pinned ? current : null));
  }

  const kicker = study ? `Appendix · ${pathOf(categories, study.categoryId).map((row) => row.name).join(' · ')}` : '';

  return (
    <div className={`appendix-browser${navOpen ? ' nav-open' : ''}`}>
      <aside className="card appendix-side" aria-label="Appendix topics">
        <div className="appendix-side-head">
          <p className="eyebrow">Topics</p>
          <h2>Appendix</h2>
          <label className="appendix-find">
            <Icon kind="search" />
            <input value={topicQuery} onChange={(event) => setTopicQuery(event.target.value)} placeholder="Find a topic" aria-label="Find a topic" />
          </label>
        </div>
        <div className="appendix-tree" role="tree">
          {loading && <p className="appendix-empty">Loading topics…</p>}
          {!loading && error && (
            <p className="appendix-empty">
              {error} <button type="button" onClick={load}>Try again</button>
            </p>
          )}
          {!loading && !error && tree.length === 0 && <p className="appendix-empty">{topicQuery ? 'No topic matches that search.' : 'No topics yet.'}</p>}
          {tree.map((node) => (
            <Topic
              key={node.id}
              node={node}
              depth={0}
              open={open}
              selected={selected}
              counts={direct}
              forceOpen={topicQuery.trim().length > 0}
              onOpen={(id) => setOpen((current) => {
                const next = new Set(current);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              })}
              onChoose={choose}
            />
          ))}
        </div>
      </aside>

      <section className="card appendix-main" aria-label={selectedNode?.name ?? 'Appendix words'}>
        <header className="appendix-main-head">
          <div>
            <p className="eyebrow">{selectedPath.length > 1 ? selectedPath.slice(0, -1).map((row) => row.name).join(' · ') : 'Word Power'}</p>
            <h1>{selectedNode?.name ?? 'Appendix'}</h1>
            <p>{loading ? 'Loading words…' : query ? `${visibleItems.length.toLocaleString()} matching words` : `${visibleItems.length.toLocaleString()} words`}</p>
          </div>
          <div className="appendix-main-tools">
            <button type="button" className="s-btn ghost appendix-topics-btn" onClick={() => setNavOpen((value) => !value)} aria-expanded={navOpen}>
              <Icon kind="list" /> Topics
            </button>
            <label className="appendix-find">
              <Icon kind="search" />
              <input value={wordQuery} onChange={(event) => setWordQuery(event.target.value)} placeholder="Search for word" aria-label="Search for word" />
            </label>
          </div>
        </header>
        <div className="appendix-scroll" ref={scroller} onScroll={hidePeek} key={selected ?? 'none'}>
          {!loading && !error && visibleItems.length === 0 && (
            <p className="appendix-empty">{query ? 'No words match that search.' : 'No words in this topic yet.'}</p>
          )}
          {grouped.map((group) => (
            <div key={group.id}>
              {group.label && group.id !== selected && (
                <h2 className="appendix-group">
                  {group.label}
                  <span>{group.items.length.toLocaleString()}</span>
                </h2>
              )}
              <ul className="appendix-words">
                {group.items.map((item, index) => (
                  <li key={item.id} className={`tone-${index % 4}`} onMouseEnter={(event) => {
                    const word = event.currentTarget.querySelector('.appendix-word');
                    if (word instanceof HTMLElement) void showPeek(item, word, false);
                  }} onMouseLeave={hidePeek}>
                    <button
                      type="button"
                      className="appendix-word"
                      onClick={() => {
                        setPeek(null);
                        setStudy(item);
                      }}
                      onFocus={(event) => void showPeek(item, event.currentTarget, false)}
                      onBlur={hidePeek}
                    >
                      {item.displayWord}
                    </button>
                    <button
                      type="button"
                      className="appendix-brief"
                      aria-label={`Brief meaning of ${item.displayWord}`}
                      onClick={(event) => {
                        const word = event.currentTarget.parentElement?.querySelector('.appendix-word');
                        if (word instanceof HTMLElement) void showPeek(item, word, true);
                      }}
                    >
                      <Icon kind="book" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {peek && createPortal(
        <div
          ref={card}
          className={`appendix-peek side-${peek.side}${peek.pinned ? ' pinned' : ''}`}
          style={{ top: peek.top, left: peek.left }}
          role="tooltip"
        >
          <span className="appendix-peek-sheen" aria-hidden="true" />
          <h3>{peek.item.displayWord}</h3>
          <p className={`appendix-peek-gist${peek.loading ? ' is-wait' : ''}`}>{peek.loading ? '' : peek.gist ?? 'No dictionary meaning yet.'}</p>
        </div>,
        document.body,
      )}

      {study && (
        <WordLook
          word={studyWordOf(study)}
          inRepo
          language={language}
          thesaurus={thesaurus}
          kicker={kicker}
          onClose={() => setStudy(null)}
        />
      )}
    </div>
  );
}

function Topic({
  node,
  depth,
  open,
  selected,
  counts,
  forceOpen,
  onOpen,
  onChoose,
}: {
  node: AppendixNode;
  depth: number;
  open: Set<string>;
  selected: string | null;
  counts: Map<string, number>;
  forceOpen: boolean;
  onOpen: (id: string) => void;
  onChoose: (id: string) => void;
}) {
  const expanded = forceOpen || open.has(node.id);
  const count = roll(node, counts);
  const hasKids = node.children.length > 0;
  return (
    <div className={`appendix-topic depth-${Math.min(depth, 2)}`} role="treeitem" aria-expanded={hasKids ? expanded : undefined} aria-selected={node.id === selected}>
      <div
        className={`appendix-topic-row${node.id === selected ? ' on' : ''}`}
        onMouseEnter={() => {
          if (depth > 0 && node.id !== selected) onChoose(node.id);
        }}
      >
        {hasKids ? (
          <button type="button" className={`appendix-twist${expanded ? ' open' : ''}`} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.name}`} onClick={() => onOpen(node.id)}>
            <Icon kind="chevron" />
          </button>
        ) : (
          <span className="appendix-twist empty" aria-hidden="true" />
        )}
        <button type="button" className="appendix-topic-name" onClick={() => onChoose(node.id)}>
          <span>{node.name}</span>
          {count > 0 && <em>{count.toLocaleString()}</em>}
        </button>
      </div>
      {hasKids && expanded && (
        <div className="appendix-branch">
          {node.children.map((child) => (
            <Topic key={child.id} node={child} depth={depth + 1} open={open} selected={selected} counts={counts} forceOpen={forceOpen} onOpen={onOpen} onChoose={onChoose} />
          ))}
        </div>
      )}
    </div>
  );
}
