'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/icon';
import { useNotice } from '@/components/use-notice';
import {
  addAppendixWords,
  deleteAppendixItems,
  fetchAppendixCategories,
  fetchAppendixItems,
  importAppendixWords,
  moveAppendixItems,
  pathOf,
  subtreeIds,
  treeOf,
  type AppendixCategory,
  type AppendixItem,
  type AppendixNode,
} from '@/lib/appendix';
import { parseAppendixWordsWorkbook } from '@/lib/excel-appendix';

function roll(node: AppendixNode, direct: Map<string, number>): number {
  return (direct.get(node.id) ?? 0) + node.children.reduce((sum, child) => sum + roll(child, direct), 0);
}

export function AppendixWords() {
  const [categories, setCategories] = useState<AppendixCategory[]>([]);
  const [items, setItems] = useState<AppendixItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [topicQuery, setTopicQuery] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [dest, setDest] = useState('');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice, noticeTone] = useNotice('');
  const fileInput = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    void Promise.all([fetchAppendixCategories(), fetchAppendixItems('all')])
      .then(([nextCategories, nextItems]) => {
        setCategories(nextCategories);
        setItems(nextItems.filter((item) => item.status === 'published'));
        setOpen(new Set(nextCategories.filter((row) => !row.parentId).map((row) => row.id)));
        setSelected((current) => (current && nextCategories.some((row) => row.id === current) ? current : nextCategories.find((row) => !row.parentId)?.id ?? null));
      })
      .catch((err: unknown) => setNotice(err instanceof Error ? err.message : 'Words could not be loaded.', 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function run(work: () => Promise<void>) {
    setBusy(true);
    try {
      await work();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'That did not work.', 'error');
    } finally {
      setBusy(false);
    }
  }

  const tree = useMemo(() => treeOf(categories), [categories]);
  const direct = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
    return counts;
  }, [items]);
  const shownTree = useMemo(() => {
    const q = topicQuery.trim().toLowerCase();
    if (!q) return tree;
    function keep(nodes: AppendixNode[]): AppendixNode[] {
      const out: AppendixNode[] = [];
      for (const node of nodes) {
        const children = keep(node.children);
        if (node.name.toLowerCase().includes(q)) out.push(node);
        else if (children.length) out.push({ ...node, children });
      }
      return out;
    }
    return keep(tree);
  }, [tree, topicQuery]);

  const scope = useMemo(() => (selected ? subtreeIds(categories, selected) : new Set<string>()), [categories, selected]);
  const needle = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      items
        .filter((item) => scope.has(item.categoryId))
        .filter((item) => !needle || item.displayWord.toLowerCase().includes(needle) || item.lemma.includes(needle))
        .sort((a, b) => a.displayWord.localeCompare(b.displayWord)),
    [items, scope, needle],
  );
  const destinations = useMemo(
    () =>
      categories
        .map((row) => ({ id: row.id, label: pathOf(categories, row.id).map((part) => part.name).join(' / ') }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [categories],
  );
  const selectedName = categories.find((row) => row.id === selected)?.name ?? 'Words';
  const allVisiblePicked = visible.length > 0 && visible.every((item) => picked.has(item.id));

  async function onImport(file: File | null) {
    if (!file) return;
    await run(async () => {
      const drafts = await parseAppendixWordsWorkbook(await file.arrayBuffer());
      if (!drafts.length) throw new Error('No words found. Use one sheet per category, with the sub-category in column A and the word in column B.');
      setNotice(`Filing ${drafts.length.toLocaleString()} rows…`);
      const result = await importAppendixWords(drafts, (done, total) => {
        if (done === total || done % 400 === 0) setNotice(`Filed ${done.toLocaleString()} of ${total.toLocaleString()} new words…`);
      });
      const [nextCategories, nextItems] = await Promise.all([fetchAppendixCategories(), fetchAppendixItems('all')]);
      setCategories(nextCategories);
      setItems(nextItems.filter((item) => item.status === 'published'));
      setOpen(new Set(nextCategories.map((row) => row.id)));
      setNotice(
        `Added ${result.added.toLocaleString()} words. ${result.skipped.toLocaleString()} were already filed or blank.${result.removed ? ` Removed ${result.removed.toLocaleString()} topics that were actually words.` : ''}`,
        'success',
      );
    });
    if (fileInput.current) fileInput.current.value = '';
  }

  return (
    <section className="admin-card list-card cat-card">
      <div className="cat-head">
        <div>
          <h2>Words</h2>
          <p className="meta">Import the topic workbook once. Later, add a few words to the selected topic or move them.</p>
        </div>
        <div className="cat-tools">
          <input
            ref={fileInput}
            type="file"
            className="sr-only"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => void onImport(event.target.files?.[0] ?? null)}
          />
          <button type="button" className="go" onClick={() => fileInput.current?.click()} disabled={busy}>
            Import words
          </button>
        </div>
      </div>
      {notice && (
        <p className={`cat-note notice ${noticeTone}`} role={noticeTone === 'error' ? 'alert' : 'status'}>
          {notice}
        </p>
      )}
      <div className="appendix-work">
        <div className="appendix-work-side">
          <label className="appendix-find admin">
            <Icon kind="search" />
            <input value={topicQuery} onChange={(event) => setTopicQuery(event.target.value)} placeholder="Find a topic" aria-label="Find a topic" />
          </label>
          <div className="appendix-work-tree">
            {loading && <p className="meta">Loading…</p>}
            {!loading && shownTree.length === 0 && <p className="meta">No categories yet. Add them on the Categories tab, or import a words workbook.</p>}
            {shownTree.map((node) => (
              <AdminTopic
                key={node.id}
                node={node}
                depth={0}
                open={open}
                selected={selected}
                counts={direct}
                onOpen={(id) =>
                  setOpen((current) => {
                    const next = new Set(current);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
                forceOpen={topicQuery.trim().length > 0}
                onChoose={(id) => {
                  setSelected(id);
                  setPicked(new Set());
                  setQuery('');
                }}
              />
            ))}
          </div>
        </div>
        <div className="appendix-work-main">
          <div className="appendix-work-bar">
            <strong>{selectedName}</strong>
            <span>{visible.length.toLocaleString()} words</span>
            <label className="appendix-find admin grow">
              <Icon kind="search" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter words" aria-label="Filter words" />
            </label>
            <button type="button" className="quiet" disabled={!selected || busy} onClick={() => setAdding((value) => !value)}>
              <Icon kind="plus" /> Add words
            </button>
          </div>
          {adding && selected && (
            <form
              className="appendix-add"
              onSubmit={(event) => {
                event.preventDefault();
                void run(async () => {
                  const result = await addAppendixWords(selected, draft);
                  setDraft('');
                  setAdding(false);
                  const next = await fetchAppendixItems('all');
                  setItems(next.filter((item) => item.status === 'published'));
                  setNotice(`Added ${result.added.toLocaleString()} words${result.skipped ? ` · ${result.skipped} already there` : ''}.`, 'success');
                });
              }}
            >
              <label>
                One word or phrase on each line. They are filed under {selectedName}.
                <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={5} placeholder={'sibling\nnext of kin'} />
              </label>
              <div>
                <button type="submit" className="go" disabled={busy}>Add</button>
                <button type="button" className="quiet" onClick={() => setAdding(false)}>Cancel</button>
              </div>
            </form>
          )}
          {picked.size > 0 && (
            <div className="appendix-move">
              <span>{picked.size.toLocaleString()} selected</span>
              <select value={dest} onChange={(event) => setDest(event.target.value)} aria-label="Move to">
                <option value="">Move to…</option>
                {destinations.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              <button
                type="button"
                className="go"
                disabled={!dest || busy}
                onClick={() =>
                  void run(async () => {
                    const result = await moveAppendixItems([...picked], dest);
                    const next = await fetchAppendixItems('all');
                    setItems(next.filter((item) => item.status === 'published'));
                    setPicked(new Set());
                    setNotice(`Moved ${result.moved.toLocaleString()}${result.skipped ? ` · ${result.skipped} already there or unchanged` : ''}.`, 'success');
                  })
                }
              >
                Move
              </button>
              <button
                type="button"
                className="quiet"
                disabled={busy}
                onClick={() => {
                  const count = picked.size;
                  if (!window.confirm(`Remove ${count} word${count === 1 ? '' : 's'} from the appendix?`)) return;
                  void run(async () => {
                    await deleteAppendixItems([...picked]);
                    setItems((list) => list.filter((item) => !picked.has(item.id)));
                    setPicked(new Set());
                    setNotice(`Removed ${count.toLocaleString()}.`, 'success');
                  });
                }}
              >
                Remove
              </button>
            </div>
          )}
          <div className="appendix-work-scroll">
            {visible.length > 0 && (
              <label className="appendix-pick-all">
                <input
                  type="checkbox"
                  checked={allVisiblePicked}
                  onChange={() =>
                    setPicked((current) => {
                      const next = new Set(current);
                      if (allVisiblePicked) visible.forEach((item) => next.delete(item.id));
                      else visible.forEach((item) => next.add(item.id));
                      return next;
                    })
                  }
                />
                Select these words
              </label>
            )}
            {!loading && visible.length === 0 && <p className="meta pad">No words here yet.</p>}
            <ul className="appendix-admin-words">
              {visible.map((item) => {
                const where = pathOf(categories, item.categoryId).map((row) => row.name).join(' / ');
                return (
                  <li key={item.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={picked.has(item.id)}
                        onChange={() =>
                          setPicked((current) => {
                            const next = new Set(current);
                            if (next.has(item.id)) next.delete(item.id);
                            else next.add(item.id);
                            return next;
                          })
                        }
                      />
                      <span>
                        <strong>{item.displayWord}</strong>
                        {item.categoryId !== selected && <em>{where}</em>}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminTopic({
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
  return (
    <div>
      <div className={`appendix-admin-topic${node.id === selected ? ' on' : ''}${node.enabled ? '' : ' off'}`} style={{ paddingLeft: 8 + depth * 14 }}>
        {node.children.length > 0 ? (
          <button type="button" className="cat-twist" aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.name}`} onClick={() => onOpen(node.id)}>
            <Icon kind={expanded ? 'chevron' : 'next'} />
          </button>
        ) : (
          <span className="appendix-twist empty" />
        )}
        <button type="button" onClick={() => onChoose(node.id)}>
          <span>{node.name}</span>
          {count > 0 && <em>{count.toLocaleString()}</em>}
        </button>
      </div>
      {expanded && node.children.map((child) => (
        <AdminTopic key={child.id} node={child} depth={depth + 1} open={open} selected={selected} counts={counts} forceOpen={forceOpen} onOpen={onOpen} onChoose={onChoose} />
      ))}
    </div>
  );
}
