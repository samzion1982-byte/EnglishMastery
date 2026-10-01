'use client';

import { useNotice } from '@/components/use-notice';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/icon';
import {
  addAppendixCategory,
  countDeep,
  deleteAppendixCategory,
  fetchAppendixCategories,
  flushAppendix,
  importAppendixPaths,
  importAppendixWords,
  renameAppendixCategory,
  reorderAppendixCategories,
  setAppendixCategoryEnabled,
  treeOf,
  type AppendixCategory,
  type AppendixNode,
} from '@/lib/appendix';
import {
  buildAppendixTemplate,
  buildAppendixWorkbook,
  isAppendixWordWorkbook,
  parseAppendixWorkbook,
  parseAppendixWordsWorkbook,
  saveAppendixWorkbook,
} from '@/lib/excel-appendix';
import { AppendixWords } from './appendix-words-admin';

type Draft = { parentId: string | null; name: string };

function siblingsOf(rows: AppendixCategory[], parentId: string | null) {
  return rows.filter((row) => row.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

function Row({
  node,
  depth,
  open,
  draft,
  editing,
  busy,
  onToggle,
  onDraft,
  onEdit,
  onSaveDraft,
  onSaveName,
  onCancel,
  onAddSub,
  onEnabled,
  onDelete,
  onDragStart,
  onDrop,
}: {
  node: AppendixNode;
  depth: number;
  open: Set<string>;
  draft: Draft | null;
  editing: string | null;
  busy: boolean;
  onToggle: (id: string) => void;
  onDraft: (next: Draft) => void;
  onEdit: (id: string, name: string) => void;
  onSaveDraft: () => void;
  onSaveName: (id: string) => void;
  onCancel: () => void;
  onAddSub: (id: string) => void;
  onEnabled: (id: string, enabled: boolean) => void;
  onDelete: (node: AppendixNode) => void;
  onDragStart: (id: string, parentId: string | null) => void;
  onDrop: (id: string, parentId: string | null) => void;
}) {
  const expanded = open.has(node.id);
  const hasKids = node.children.length > 0;
  const kids = node.children.length;
  const addingHere = draft?.parentId === node.id;

  return (
    <li>
      <div
        className={`cat-row${node.enabled ? '' : ' off'}${expanded && hasKids ? ' open' : ''}${depth > 0 ? ' sub' : ''}`}
        style={{ paddingLeft: 12 + depth * 22 }}
        draggable={!busy && !editing && !draft}
        onDragStart={() => onDragStart(node.id, node.parentId)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onDrop(node.id, node.parentId);
        }}
      >
        <span className="cat-grip" aria-hidden="true">
          <Icon kind="grip" />
        </span>
        {hasKids ? (
          <button type="button" className={`cat-twist${expanded ? ' open' : ''}`} aria-expanded={expanded} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${node.name}`} onClick={() => onToggle(node.id)}>
            <Icon kind="chevron" />
          </button>
        ) : (
          <span className="cat-twist empty" aria-hidden="true" />
        )}
        <span className="cat-folder" aria-hidden="true">
          <Icon kind="folder" />
        </span>
        {editing === node.id ? (
          <form
            className="cat-name-form"
            onSubmit={(e) => {
              e.preventDefault();
              onSaveName(node.id);
            }}
          >
            <input value={draft?.name ?? node.name} onChange={(e) => onDraft({ parentId: node.parentId, name: e.target.value })} autoFocus aria-label="Name" />
            <button type="submit" className="go" disabled={busy}>
              Save
            </button>
            <button type="button" className="quiet" onClick={onCancel}>
              Cancel
            </button>
          </form>
        ) : (
          <span className="cat-name">{node.name}</span>
        )}
        {kids > 0 && <span className="cat-count">{kids}</span>}
        <span className="cat-actions">
          <button type="button" className="cat-chip" onClick={() => onAddSub(node.id)} disabled={busy}>
            <Icon kind="plus" /> Add subcategory
          </button>
          <button type="button" className="cat-icon" title={`Rename ${node.name}`} aria-label={`Rename ${node.name}`} onClick={() => onEdit(node.id, node.name)} disabled={busy}>
            <Icon kind="pen" />
          </button>
          <button type="button" className="cat-icon" aria-label={node.enabled ? `Turn off ${node.name}` : `Turn on ${node.name}`} onClick={() => onEnabled(node.id, !node.enabled)} disabled={busy}>
            {node.enabled ? 'On' : 'Off'}
          </button>
          <button type="button" className="cat-icon danger" title={`Delete ${node.name}`} aria-label={`Delete ${node.name}`} onClick={() => onDelete(node)} disabled={busy}>
            <Icon kind="trash" />
          </button>
        </span>
      </div>
      {expanded && hasKids && (
        <ul>
          {node.children.map((child) => (
            <Row
              key={child.id}
              node={child}
              depth={depth + 1}
              open={open}
              draft={draft}
              editing={editing}
              busy={busy}
              onToggle={onToggle}
              onDraft={onDraft}
              onEdit={onEdit}
              onSaveDraft={onSaveDraft}
              onSaveName={onSaveName}
              onCancel={onCancel}
              onAddSub={onAddSub}
              onEnabled={onEnabled}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDrop={onDrop}
            />
          ))}
        </ul>
      )}
      {addingHere && !editing && (
        <form
          className="cat-name-form nest"
          style={{ paddingLeft: 34 + (depth + 1) * 22 }}
          onSubmit={(e) => {
            e.preventDefault();
            onSaveDraft();
          }}
        >
          <input value={draft.name} onChange={(e) => onDraft({ ...draft, name: e.target.value })} placeholder="Sub-category name" autoFocus aria-label="Sub-category name" />
          <button type="submit" className="go" disabled={busy}>
            Add
          </button>
          <button type="button" className="quiet" onClick={onCancel}>
            Cancel
          </button>
        </form>
      )}
    </li>
  );
}

export function AppendixAdmin() {
  const [rows, setRows] = useState<AppendixCategory[]>([]);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; parentId: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice, noticeTone] = useNotice('');
  const [tab, setTab] = useState<'categories' | 'words'>('categories');
  const [listKey, setListKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const tree = useMemo(() => treeOf(rows), [rows]);

  function load() {
    setLoading(true); setLoadError(false);
    void fetchAppendixCategories()
      .then(setRows)
      .catch((err) => { setLoadError(true); setNotice(err instanceof Error ? err.message : 'Could not load categories.', 'error'); }).finally(() => setLoading(false));
  }
  useEffect(load, []);

  function fail(err: unknown) {
    setNotice(err instanceof Error ? err.message : 'Could not save that change.', 'error');
  }

  async function run(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setNotice('');
    try {
      await work();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startAdd(parentId: string | null) {
    setEditing(null);
    setDraft({ parentId, name: '' });
    if (parentId) setOpen((prev) => new Set(prev).add(parentId));
  }

  function startEdit(id: string, name: string) {
    const row = rows.find((r) => r.id === id);
    setEditing(id);
    setDraft({ parentId: row?.parentId ?? null, name });
  }

  function saveDraft() {
    if (!draft || editing) return;
    void run(async () => {
      const created = await addAppendixCategory(draft.name, draft.parentId, siblingsOf(rows, draft.parentId));
      setRows((list) => [...list, created]);
      setDraft(null);
    });
  }

  function saveName(id: string) {
    if (!draft) return;
    void run(async () => {
      await renameAppendixCategory(id, draft.name);
      setRows((list) => list.map((row) => (row.id === id ? { ...row, name: draft.name.trim() } : row)));
      setEditing(null);
      setDraft(null);
    });
  }

  function dropOn(targetId: string, parentId: string | null) {
    if (!drag || drag.id === targetId || drag.parentId !== parentId) return;
    const order = siblingsOf(rows, parentId).map((row) => row.id);
    const from = order.indexOf(drag.id);
    const to = order.indexOf(targetId);
    if (from < 0 || to < 0) return;
    order.splice(from, 1);
    order.splice(to, 0, drag.id);
    setDrag(null);
    void run(async () => {
      await reorderAppendixCategories(parentId, order);
      setRows((list) => list.map((row) => (row.parentId === parentId ? { ...row, sortOrder: order.indexOf(row.id) + 1 } : row)));
    });
  }

  async function onImport(file: File | null) {
    if (!file) return;
    void run(async () => {
      try {
        const buffer = await file.arrayBuffer();
        if (await isAppendixWordWorkbook(buffer)) {
          const drafts = await parseAppendixWordsWorkbook(buffer);
          if (!drafts.length) throw new Error('No words found. Each sheet is a topic, column A is the sub-category, and column B is the word.');
          const result = await importAppendixWords(drafts);
          const next = await fetchAppendixCategories();
          setRows(next);
          setOpen(new Set(next.filter((row) => !row.parentId).map((row) => row.id)));
          setTab('words');
          setNotice(
            `Filed ${result.added.toLocaleString()} words under each sheet topic.${result.removed ? ` Removed ${result.removed.toLocaleString()} topics that were actually words.` : ''}`,
            'success',
          );
          return;
        }
        const paths = await parseAppendixWorkbook(buffer);
        if (!paths.length) throw new Error('No categories found. Use the Categories sheet in the template.');
        const result = await importAppendixPaths(paths);
        const next = await fetchAppendixCategories();
        setRows(next);
        setOpen(new Set(next.map((row) => row.parentId).filter((id): id is string => !!id)));
        setNotice(`Imported ${result.added} new · ${result.updated} updated · ${result.total} in the tree.`);
      } finally {
        if (fileInput.current) fileInput.current.value = '';
      }
    });
  }

  async function onExport() {
    void run(async () => {
      const blob = await buildAppendixWorkbook(rows);
      saveAppendixWorkbook(blob, 'english-mastery-appendix-categories.xlsx');
      setNotice('Workbook exported.', 'success');
    });
  }

  function onFlush() {
    if (!window.confirm('Flush all appendix topics and words? This cannot be undone.')) return;
    void run(async () => {
      await flushAppendix();
      setRows([]);
      setOpen(new Set());
      setDraft(null);
      setEditing(null);
      setListKey((key) => key + 1);
      setNotice('Appendix flushed. Import the workbook again for a fresh list.', 'success');
    });
  }

  async function onTemplate() {
    void run(async () => {
      const blob = await buildAppendixTemplate();
      saveAppendixWorkbook(blob, 'english-mastery-appendix-template.xlsx');
      setNotice('Template downloaded. Fill the Categories sheet, then Import.');
    });
  }

  return (
    <>
      <header className="page-head">
        <div>
          <p className="admin-kicker">Content</p>
          <h1>Appendix</h1>
          <p className="admin-note">Topics on Categories. Words can be imported in bulk, added a few at a time, or moved to another topic.</p>
        </div>
        <button type="button" className="quiet danger" onClick={onFlush} disabled={busy}>
          Flush all
        </button>
      </header>

      <div className="appendix-tabs" role="tablist" aria-label="Appendix">
        <button type="button" role="tab" aria-selected={tab === 'categories'} className={tab === 'categories' ? 'on' : ''} onClick={() => setTab('categories')}>
          <Icon kind="folder" />
          Categories
        </button>
        <button type="button" role="tab" aria-selected={tab === 'words'} className={tab === 'words' ? 'on' : ''} onClick={() => setTab('words')}>
          <Icon kind="list" />
          Words
        </button>
      </div>

      {notice && (
        <p className={`cat-note notice ${noticeTone}`} role={noticeTone === 'error' ? 'alert' : 'status'}>
          {notice}
        </p>
      )}

      {tab === 'words' ? <AppendixWords key={listKey} /> : <section className="admin-card list-card cat-card">
        <div className="cat-head">
          <div>
            <h2>Categories</h2>
            <p className="meta">Add categories, then nest sub-categories — the same idea as a chart of accounts.</p>
          </div>
          <div className="cat-tools">
            <input
              ref={fileInput}
              type="file"
              className="sr-only"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(e) => void onImport(e.target.files?.[0] ?? null)}
            />
            <button type="button" className="quiet" onClick={() => fileInput.current?.click()} disabled={busy}>
              Import
            </button>
            <button type="button" className="quiet" onClick={() => void onExport()} disabled={busy}>
              Export
            </button>
            <button type="button" className="quiet" onClick={() => void onTemplate()} disabled={busy}>
              Template
            </button>
            <button type="button" className="go" onClick={() => startAdd(null)} disabled={busy}>
              <Icon kind="plus" /> Add
            </button>
          </div>
        </div>

        {draft?.parentId === null && !editing && (
          <form
            className="cat-name-form pad"
            onSubmit={(e) => {
              e.preventDefault();
              saveDraft();
            }}
          >
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Category name" autoFocus aria-label="Category name" />
            <button type="submit" className="go" disabled={busy}>
              Add
            </button>
            <button type="button" className="quiet" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </form>
        )}

        {tree.length === 0 && !draft ? (
          <p className="cat-empty" role="status">{loading ? "Loading categories…" : loadError ? "Categories could not be loaded." : "No categories yet. Add a category above or import a completed template."}{loadError && <button type="button" onClick={load}>Retry</button>}</p>
        ) : (
          <ul className="cat-tree">
            {tree.map((node) => (
              <Row
                key={node.id}
                node={node}
                depth={0}
                open={open}
                draft={draft}
                editing={editing}
                busy={busy}
                onToggle={toggle}
                onDraft={setDraft}
                onEdit={startEdit}
                onSaveDraft={saveDraft}
                onSaveName={saveName}
                onCancel={() => {
                  setDraft(null);
                  setEditing(null);
                }}
                onAddSub={(id) => startAdd(id)}
                onEnabled={(id, enabled) =>
                  void run(async () => {
                    await setAppendixCategoryEnabled(id, enabled);
                    setRows((list) => list.map((row) => (row.id === id ? { ...row, enabled } : row)));
                  })
                }
                onDelete={(node) => {
                  const extra = countDeep(node);
                  const ok = window.confirm(
                    extra
                      ? `Delete “${node.name}” and its ${extra} sub-categor${extra === 1 ? 'y' : 'ies'}?`
                      : `Delete “${node.name}”?`,
                  );
                  if (!ok) return;
                  void run(async () => {
                    await deleteAppendixCategory(node.id);
                    setRows((list) => {
                      const drop = new Set<string>([node.id]);
                      const walk = (id: string) => {
                        for (const row of list) {
                          if (row.parentId === id && !drop.has(row.id)) {
                            drop.add(row.id);
                            walk(row.id);
                          }
                        }
                      };
                      walk(node.id);
                      return list.filter((row) => !drop.has(row.id));
                    });
                  });
                }}
                onDragStart={(id, parentId) => setDrag({ id, parentId })}
                onDrop={dropOn}
              />
            ))}
          </ul>
        )}
      </section>}
    </>
  );
}
