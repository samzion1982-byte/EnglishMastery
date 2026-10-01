'use client';

import { useNotice } from '@/components/use-notice';

import { useEffect, useMemo, useRef, useState } from 'react';
import { acceptDoubt, archiveWord, autoFileDoubts, flushBuckets, ingestAssigned, ingestIntoBucket, moveWord, removeWord, resortLiveWords } from '@/lib/ingest';
import { sortWordsLocal } from '@/lib/ai-sort';
import { buildVocabWorkbook, downloadBlob, parseVocabWorkbook } from '@/lib/excel-vocab';
import { checkEnglishWords } from '@/lib/word-check';
import {
  bucketLabel,
  buckets,
  lemmaOf,
  liveBuckets,
  loadStore,
  parseWordList,
  saveStore,
  type Bucket,
  type CoreStore,
  emptyStore,
} from '@/lib/vocab';
import { Pagination } from '@/components/pagination';
import { Icon } from '@/components/icon';
import { createBrowserSupabase } from '@/lib/supabase';
import { EnrichPanel } from './enrich-panel';
import { WordEditor } from './word-editor';
import {
  fetchServerWords,
  snapshotOf,
  storeFromServer,
  syncToServer,
  type Snapshot,
} from '@/lib/core-sync';

type SyncState = 'connecting' | 'saving' | 'synced' | 'offline' | 'error';

function isExcelName(name: string) {
  return /\.xlsx?$/i.test(name);
}

export function CoreVocabAdmin({ canFlush }: { canFlush: boolean }) {
  const [store, setStore] = useState<CoreStore>(emptyStore());
  const [hydrated, setHydrated] = useState(false);
  const [text, setText] = useState('');
  const [notice, setNotice, noticeTone] = useNotice('');
  const [filter, setFilter] = useState('');
  const [active, setActive] = useState<Bucket>('beginner');
  const [busy, setBusy] = useState(false);
  const importInput = useRef<HTMLInputElement>(null);
  const [sync, setSync] = useState<{ state: SyncState; detail: string }>({ state: 'connecting', detail: '' });
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const snapshotRef = useRef<Snapshot | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncing = useRef(false);
  const latestStore = useRef<CoreStore>(store);
  const [enrichKey, setEnrichKey] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkBucket, setBulkBucket] = useState<Bucket>('beginner');
  const [undo, setUndo] = useState<{ lemma: string; bucket: Bucket }[]>([]);
  const [adding, setAdding] = useState(true);
  const offlineBase = useRef<CoreStore | null>(null);
  useEffect(() => { setPage(1); setSelected([]); }, [filter, active]);

  useEffect(() => {
    let cancelled = false;
    const loaded = loadStore();
    offlineBase.current = structuredClone(loaded);
    const filed = autoFileDoubts(loaded);
    void (async () => {
      let next = { words: [...loaded.words], doubts: [...loaded.doubts] };
      try {
        const rows = await fetchServerWords(createBrowserSupabase());
        if (cancelled) return;
        if (rows.length) next = storeFromServer(rows, next);
        snapshotRef.current = snapshotOf(rows);
        setSnapshot(snapshotRef.current);
        setSync({ state: 'synced', detail: '' });
      } catch (err) {
        if (cancelled) return;
        setSync({ state: 'offline', detail: err instanceof Error ? err.message : 'Supabase is unreachable.' });
      }
      setStore(next);
      setHydrated(true);
      if (filed > 0) setNotice(`Auto-sorted ${filed} words from the review queue.`);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveStore(store);
    latestStore.current = store;
    if (!snapshotRef.current) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => void pushChanges(), 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, hydrated]);

  async function pushChanges() {
    if (!snapshotRef.current) return;
    if (syncing.current) {
      syncTimer.current = setTimeout(() => void pushChanges(), 600);
      return;
    }
    syncing.current = true;
    setSync({ state: 'saving', detail: '' });
    try {
      const result = await syncToServer(createBrowserSupabase(), latestStore.current, snapshotRef.current);
      snapshotRef.current = result.snapshot;
      setSnapshot(result.snapshot);
      if (result.pushed || result.deleted) setEnrichKey((k) => k + 1);
      setSync({ state: 'synced', detail: '' });
    } catch (err) {
      setSync({ state: 'error', detail: err instanceof Error ? err.message : 'Could not save to Supabase.' });
    } finally {
      syncing.current = false;
    }
  }

  async function reconnect() {
    setSync({ state: 'connecting', detail: '' });
    try {
      if (!snapshotRef.current) {
        const rows = await fetchServerWords(createBrowserSupabase());
        snapshotRef.current = snapshotOf(rows);
        setSnapshot(snapshotRef.current);
        const remote = storeFromServer(rows, latestStore.current);
        const base = new Map((offlineBase.current?.words ?? []).map(w => [w.lemma, w]));
        const local = new Map(latestStore.current.words.map(w => [w.lemma, w]));
        const changed = latestStore.current.words.filter(w => !base.has(w.lemma) || JSON.stringify(base.get(w.lemma)) !== JSON.stringify(w));
        const changedIds = new Set(changed.map(w => w.lemma));
        const removedIds = new Set([...base.keys()].filter(id => !local.has(id)));
        const merged = { words: [...remote.words.filter(w => !changedIds.has(w.lemma) && !removedIds.has(w.lemma)), ...changed], doubts: latestStore.current.doubts };
        latestStore.current = merged;
        setStore(merged);
      }
      await pushChanges();
    } catch (err) { setSync({ state: 'error', detail: err instanceof Error ? err.message : 'Could not reconnect.' }); }
  }
  const [editing, setEditing] = useState<{ lemma: string; word: string } | null>(null);

  const syncLabel: Record<SyncState, string> = {
    connecting: 'Connecting…',
    saving: 'Saving…',
    synced: 'Live for students',
    offline: 'Saved on this browser only',
    error: 'Not saved to students',
  };

  const counts = useMemo(() => {
    const next: Record<Bucket, number> = { beginner: 0, intermediate: 0, advanced: 0, archive: 0 };
    for (const word of store.words) next[word.bucket] += 1;
    return next;
  }, [store.words]);

  const query = filter.trim().toLowerCase();

  const list = useMemo(() => {
    return store.words
      .filter((w) => query ? w.lemma.includes(query) || w.word.toLowerCase().includes(query) : w.bucket === active)
      .sort((a, b) => a.word.localeCompare(b.word));
  }, [store.words, active, query]);

  const pages = Math.max(1, Math.ceil(list.length / 50));
  const currentPage = Math.min(page, pages);
  const visible = list.slice((currentPage - 1) * 50, currentPage * 50);
  function bulkMove() {
    const next = { words: [...store.words], doubts: [...store.doubts] };
    setUndo(store.words.filter(w => selected.includes(w.lemma)).map(w => ({ lemma: w.lemma, bucket: w.bucket })));
    selected.forEach(lemma => moveWord(next, lemma, bulkBucket));
    commit(next);
    setNotice('Moved ' + selected.length + ' words to ' + bucketLabel[bulkBucket] + '.');
    setSelected([]);
  }
  function undoMove() {
    const next = { words: [...store.words], doubts: [...store.doubts] };
    undo.forEach(item => { if (next.words.some(w => w.lemma === item.lemma)) moveWord(next, item.lemma, item.bucket); });
    commit(next); setUndo([]); setNotice('Previous move undone.');
  }

  function commit(next: CoreStore) {
    setStore({ words: [...next.words], doubts: [...next.doubts] });
  }

  function fileWords(words: string[], batchId: string) {
    const sorted = sortWordsLocal(words);
    const next = { words: [...store.words], doubts: [...store.doubts] };
    const result = ingestAssigned(next, sorted.assignments, batchId);
    commit(next);
    return result;
  }

  function runPaste() {
    void (async () => {
      const words = parseWordList(text);
      if (!words.length) {
        setNotice('No words found in the list.');
        return;
      }
      setBusy(true);
      try {
        const checked = await checkEnglishWords(words);
        if (!checked.accepted.length) {
          const sample = checked.rejected
            .slice(0, 4)
            .map((r) => (r.suggestions[0] ? `${r.word}→${r.suggestions[0]}?` : r.word))
            .join(', ');
          setNotice(
            checked.rejected.length
              ? `No valid English words to add. Check: ${sample}`
              : 'No valid English words to add.',
          );
          return;
        }

        const result = fileWords(checked.accepted, `b-${Date.now()}`);
        setText('');
        setAdding(false);

        const bits = [`Added ${result.filed}`];
        if (result.merged) bits.push(`merged ${result.merged}`);
        if (result.queued) bits.push(`review ${result.queued}`);
        if (checked.corrected.length) {
          bits.push(
            `fixed ${checked.corrected.length} typo${checked.corrected.length === 1 ? '' : 's'} (${checked.corrected
              .slice(0, 3)
              .map((c) => `${c.from}→${c.to}`)
              .join(', ')}${checked.corrected.length > 3 ? '…' : ''})`,
          );
        }
        if (checked.rejected.length) {
          bits.push(
            `skipped ${checked.rejected.length} (${checked.rejected
              .slice(0, 4)
              .map((r) => (r.suggestions[0] ? `${r.word}→${r.suggestions[0]}?` : r.word))
              .join(', ')}${checked.rejected.length > 4 ? '…' : ''})`,
          );
        }
        setNotice(bits.join(' · '), 'success');
      } catch (err) {
        setNotice(err instanceof Error ? err.message : 'Could not check or sort words.', 'error');
      } finally {
        setBusy(false);
      }
    })();
  }

  async function onImport(file: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const batchId = `i-${Date.now()}`;

      if (isExcelName(file.name)) {
        const parsed = await parseVocabWorkbook(await file.arrayBuffer());
        if (parsed.mode === 'by-sheet') {
          const next = { words: [...store.words], doubts: [...store.doubts] };
          let filed = 0;
          let merged = 0;
          let moved = 0;
          for (const group of parsed.groups) {
            const incoming = group.words.map((word) => ({ word, lemma: lemmaOf(word) }));
            const result = ingestIntoBucket(next, incoming, group.bucket, `${batchId}-${group.bucket}`);
            filed += result.filed;
            merged += result.merged;
            moved += result.moved;
          }
          commit(next);
          setNotice(`Imported sheets · filed ${filed} · moved ${moved} · merged ${merged}`);
        } else {
          if (!parsed.words.length) {
            setNotice('No words found in column A.');
            return;
          }
          const result = fileWords(parsed.words, batchId);
          const queued = result.queued ? ` · review ${result.queued}` : '';
          setNotice(`Filed ${result.filed} · merged ${result.merged}${queued} · via local sorter`);
        }
      } else {
        const words = parseWordList(await file.text());
        if (!words.length) {
          setNotice('No words found in that file.');
          return;
        }
        const result = fileWords(words, batchId);
        const queued = result.queued ? ` · review ${result.queued}` : '';
        setNotice(`Filed ${result.filed} · merged ${result.merged}${queued} · via local sorter`);
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Import failed.', 'error');
    } finally {
      setBusy(false);
      if (importInput.current) importInput.current.value = '';
    }
  }

  async function onExport() {
    setBusy(true);
    try {
      const blob = await buildVocabWorkbook(store);
      downloadBlob(blob, `english-mastery-core-vocab.xlsx`);
      setNotice('Workbook exported.', 'success');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Export failed.', 'error');
    } finally {
      setBusy(false);
    }
  }

  function onMove(lemma: string, bucket: Bucket) {
    const next = { words: [...store.words], doubts: [...store.doubts] };
    setUndo(store.words.filter(w => w.lemma === lemma).map(w => ({ lemma: w.lemma, bucket: w.bucket })));
    moveWord(next, lemma, bucket);
    commit(next);
  }

  function onArchive(lemma: string) {
    const next = { words: [...store.words], doubts: [...store.doubts] };
    setUndo(store.words.filter(w => w.lemma === lemma).map(w => ({ lemma: w.lemma, bucket: w.bucket })));
    archiveWord(next, lemma);
    setNotice("Word archived. You can restore it from Archive or undo below.");
    commit(next);
  }

  function onRemove(lemma: string, word: string) {
    if (!window.confirm(`Permanently delete “${word}”? This cannot be undone.`)) return;
    const next = { words: [...store.words], doubts: [...store.doubts] };
    removeWord(next, lemma);
    commit(next);
    setNotice(`Deleted “${word}”.`);
  }

  function onFlush() {
    if (!canFlush) return;
    const total = store.words.length + store.doubts.length;
    if (!total) {
      setNotice('Buckets are already empty.');
      return;
    }
    if (!window.confirm(`Flush all ${store.words.length} words? This cannot be undone.`)) return;
    const next = { words: [...store.words], doubts: [...store.doubts] };
    flushBuckets(next);
    commit(next);
    setNotice('All buckets flushed.');
  }

  function onResort() {
    const live = store.words.filter((w) => w.bucket !== 'archive').length;
    if (!live) {
      setNotice('No live words to re-sort.');
      return;
    }
    if (!window.confirm(`Re-sort all ${live} live words with the current local sorter?`)) return;
    const next = { words: [...store.words], doubts: [...store.doubts] };
    const result = resortLiveWords(next);
    commit(next);
    setNotice(`Re-sorted ${result.total} · moved ${result.moved}`);
  }

  return (
    <>
      <header className="page-head compact">
        <div>
          <h1>Core vocabulary</h1>
          <p className="page-sub">
            {counts.beginner + counts.intermediate + counts.advanced} live words · {counts.archive} archived
            {store.doubts.length > 0 ? ` · ${store.doubts.length} to review` : ''}
          </p>
        </div>
        <span className={`sync-badge ${sync.state}`} title={sync.detail || undefined}>
          <span className="sync-dot" aria-hidden="true" />
          {syncLabel[sync.state]}
        </span>
      </header>
      {(sync.state === 'offline' || sync.state === 'error') && sync.detail && (
        <p className="sync-note" role="status">
          Changes are saved on this browser and are waiting to reach students. Reconnect to send your changes. <button type="button" onClick={() => void reconnect()}>Retry sync</button>
        </p>
      )}

      <div className="admin-overview" aria-label="Vocabulary overview"><div><strong>{counts.beginner + counts.intermediate + counts.advanced}</strong><span>Live words</span></div><a href={store.doubts.length ? "#review-queue" : "#vocabulary-list"}><strong>{store.doubts.length}</strong><span>Need review</span></a><button type="button" onClick={() => { setActive('archive'); setFilter(''); }}><strong>{counts.archive}</strong><span>Archived words</span></button></div>
      <details className="admin-card upload-card" open={adding} onToggle={e => setAdding(e.currentTarget.open)}><summary>Add & import words</summary>
        <label className="paste-label" htmlFor="vocab-paste">
          Add words
        </label>
        <textarea
          id="vocab-paste"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Words to add"
          rows={4}
          placeholder="Type or paste words — one per line, or comma-separated"
        />
        <div className="paste-actions">
          <button className="go paste-go" type="button" onClick={runPaste} disabled={busy || !text.trim()}>
            {busy ? 'Checking…' : 'Add words'}
          </button>
          <span className="meta paste-hint">Spelling checked on add</span>
        </div>

        <div className="tools-row" aria-label="Workbook tools">
          <input
            ref={importInput}
            type="file"
            className="sr-only"
            accept=".xlsx,.xls,.txt,.csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={(e) => void onImport(e.target.files?.[0] || null)}
          />
          <button className="quiet" type="button" onClick={() => importInput.current?.click()} disabled={busy}>
            Import
          </button>
          <button className="quiet" type="button" onClick={() => void onExport()} disabled={busy}>
            Export
          </button>
          <details className="maintenance-menu"><summary>Maintenance</summary><p className="meta">These actions affect the entire vocabulary library.</p>
          <button className="quiet" type="button" onClick={onResort} disabled={busy}>
            Re-sort
          </button>
          {canFlush && (
            <>
              <span className="spacer" />
              <button className="quiet danger" type="button" onClick={onFlush} disabled={busy}>
                Delete all words permanently
              </button>
            </>
          )}
          </details>
        </div>
      </details>

        {notice && (
          <div className={`notice ${noticeTone}`} role={noticeTone === "error" ? "alert" : "status"} key={notice}>
            <span>{notice}</span>
            <button type="button" className="notice-close" aria-label="Dismiss" onClick={() => setNotice('')}>
              ×
            </button>
          </div>
        )}
      {undo.length > 0 && <div className="undo-bar" role="status"><span>Last move can be undone.</span><button type="button" onClick={undoMove}>Undo</button><button type="button" onClick={() => setUndo([])}>Dismiss</button></div>}

      {sync.state !== 'connecting' && sync.state !== 'offline' && <EnrichPanel refreshKey={enrichKey} />}

      {store.doubts.length > 0 && (
        <section id="review-queue" className="admin-card">
          <div className="card-head">
            <h2>Review queue</h2>
            <span className="meta">{store.doubts.length} unsure — pick a bucket</span>
          </div>
          <table className="vocab-table">
            <thead>
              <tr>
                <th>Word</th>
                <th className="col-actions">
                  <span className="sr-only">Place in</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {store.doubts.map((item) => (
                <tr key={item.id}>
                  <td className="word">{item.word}</td>
                  <td className="actions">
                    <div className="row-actions">
                    {liveBuckets.map((bucket) => (
                      <button
                        key={bucket}
                        type="button"
                        className="quiet compact-btn"
                        onClick={() => {
                          const next = { words: [...store.words], doubts: [...store.doubts] };
                          acceptDoubt(next, item.lemma, bucket);
                          commit(next);
                          setActive(bucket);
                        }}
                      >
                        {bucketLabel[bucket]}
                      </button>
                    ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section id="vocabulary-list" className="admin-card list-card">
        <div className="vocab-toolbar">
          <div className="bucket-tabs" role="tablist" aria-label="Buckets">
            {buckets.map((bucket) => (
              <button key={bucket} type="button" role="tab" aria-selected={!query && active === bucket} className={!query && active === bucket ? 'on' : undefined} onClick={() => { setActive(bucket); setFilter(''); }}>
                {bucketLabel[bucket]}
                <span className="tab-count">{counts[bucket]}</span>
              </button>
            ))}
          </div>
          <label className="find-wrap">
            <Icon kind="search" />
            <input
              className="find-input"
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search all buckets"
              aria-label="Search words across buckets"
            />
          </label>
        </div>

        {query && <p className="search-scope" role="status">Searching all buckets, including Archive. <button type="button" onClick={() => setFilter('')}>Clear search</button></p>}
        {selected.length > 0 && <div className="bulk-toolbar"><strong>{selected.length} selected</strong><label>Move to <select value={bulkBucket} onChange={e => setBulkBucket(e.target.value as Bucket)}>{buckets.map(b => <option key={b} value={b}>{bucketLabel[b]}</option>)}</select></label><button type="button" onClick={bulkMove}>Move selected</button><button type="button" onClick={() => setSelected([])}>Clear selection</button></div>}
        <div className="vocab-scroll">
          <table className="vocab-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="Select this page" checked={visible.length > 0 && visible.every(w => selected.includes(w.lemma))} onChange={e => setSelected(e.target.checked ? [...new Set([...selected, ...visible.map(w => w.lemma)])] : selected.filter(id => !visible.some(w => w.lemma === id)))} /></th><th>Word</th>
                <th className="col-move">Move to</th>
                <th className="col-actions">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={4} className="meta empty-row">
                    {!hydrated ? 'Loading vocabulary…' : filter ? 'No matches. Try another word or clear your search.' : 'No words in this bucket. Add words or move them from another bucket.'}
                  </td>
                </tr>
              ) : (
                visible.map((item) => (
                  <tr
                    key={item.id}
                    data-lemma={item.lemma}
                  >
<td><input type="checkbox" aria-label={`Select ${item.word}`} checked={selected.includes(item.lemma)} onChange={e => setSelected(e.target.checked ? [...selected, item.lemma] : selected.filter(id => id !== item.lemma))} /></td>
                    <td className="word">
                      {item.isNew && <span className="new-dot" title="Recently added" />}
                      {item.word}
                    </td>
                    <td>
                      <select value={item.bucket} aria-label={`Move ${item.word}`} onChange={(e) => onMove(item.lemma, e.target.value as Bucket)}>
                        {liveBuckets.map((option) => (
                          <option key={option} value={option}>
                            {bucketLabel[option]}
                          </option>
                        ))}
                        <option value="archive">{bucketLabel.archive}</option>
                      </select>
                    </td>
                    <td className="actions">
                      <div className="row-actions">
                      <button
                        type="button"
                        className="quiet icon-btn"
                        aria-label={`Edit meanings for ${item.word}`}
                        title={snapshot?.has(item.lemma) ? 'Meanings & word types' : 'Available once saved to Supabase'}
                        disabled={!snapshot?.has(item.lemma)}
                        onClick={() => setEditing({ lemma: item.lemma, word: item.word })}
                      >
                        <Icon kind="pen" />
                      </button>
                      {item.bucket === 'archive' ? (
                        <button
                          type="button"
                          className="quiet icon-btn danger"
                          aria-label={`Permanently delete ${item.word}`}
                          title="Delete permanently"
                          onClick={() => onRemove(item.lemma, item.word)}
                        >
                          <Icon kind="trash" />
                        </button>
                      ) : (
                        <button type="button" className="quiet compact-btn danger" onClick={() => onArchive(item.lemma)}>
                          Archive
                        </button>
                      )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={currentPage} pages={pages} total={list.length} onPage={setPage} />
        {editing && <WordEditor lemma={editing.lemma} word={editing.word} onClose={() => setEditing(null)} onSaved={message => setNotice(message, "success")} />}
        <div className="list-foot">
          {query ? 'All buckets' : bucketLabel[active]}
          {filter.trim() ? ` matching “${filter.trim()}”` : ''}
        </div>
      </section>
    </>
  );
}
