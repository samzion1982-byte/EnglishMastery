'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/icon';
import { useNotice } from '@/components/use-notice';
import { ROLE_LABELS } from '@/lib/access';
import { errorText } from '@/lib/error-text';
import { createBrowserSupabase } from '@/lib/supabase';

type PageNode = {
  key: string;
  label: string;
  kind: 'page';
};

type CategoryNode = {
  key: string;
  label: string;
  kind: 'category';
  children: PageNode[];
};

const COLUMNS = [
  { value: 'admin1', label: ROLE_LABELS.admin1, hint: '' },
  { value: 'user4', label: ROLE_LABELS.user4, hint: 'Principal' },
  { value: 'demo', label: ROLE_LABELS.demo, hint: 'HOD' },
  { value: 'user', label: ROLE_LABELS.user, hint: 'Teacher' },
  { value: 'admin', label: ROLE_LABELS.admin, hint: 'Tutor' },
] as const;

const TREE: CategoryNode[] = [
  {
    key: 'content',
    label: 'Learning content',
    kind: 'category',
    children: [
      { key: 'core-vocabulary', label: 'Core Vocabulary', kind: 'page' },
      { key: 'appendix', label: 'Appendix', kind: 'page' },
    ],
  },

];

const PAGES = TREE.flatMap((category) => category.children);

function defaultOn(role: string, pageKey: string) {
  if (role === 'admin1') return true;
  return pageKey === 'core-vocabulary';
}

function defaultMatrix() {
  const matrix: Record<string, Record<string, boolean>> = {};
  for (const column of COLUMNS) {
    matrix[column.value] = {};
    for (const page of PAGES) matrix[column.value][page.key] = defaultOn(column.value, page.key);
  }
  return matrix;
}

function sameMatrix(a: Record<string, Record<string, boolean>>, b: Record<string, Record<string, boolean>>) {
  return COLUMNS.every((column) => PAGES.every((page) => !!a[column.value]?.[page.key] === !!b[column.value]?.[page.key]));
}

function pageOn(page: PageNode, role: string, matrix: Record<string, Record<string, boolean>>) {
  return !!matrix[role]?.[page.key];
}

function aggregate(category: CategoryNode, role: string, matrix: Record<string, Record<string, boolean>>) {
  const on = category.children.filter((page) => pageOn(page, role, matrix)).length;
  if (on === 0) return 'none';
  if (on === category.children.length) return 'all';
  return 'some';
}

export function PermissionsManager() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [matrix, setMatrix] = useState(defaultMatrix);
  const [saved, setSaved] = useState(defaultMatrix);
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(TREE.map((category) => [category.key, true])));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice, noticeTone] = useNotice('');
  const dirty = !sameMatrix(matrix, saved);

  async function load() {
    setLoading(true);
    setLoadError('');
    const grants = await supabase.from('em_role_page_access').select('role, page_key, allowed');
    if (grants.error) {
      setLoadError(grants.error.message);
      setLoading(false);
      return;
    }
    const next = defaultMatrix();
    for (const row of grants.data || []) {
      if (!next[row.role] || !(row.page_key in next[row.role])) continue;
      next[row.role][row.page_key] = !!row.allowed;
    }
    setMatrix(next);
    setSaved(next);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function setGrant(role: string, pageKey: string, allowed: boolean) {
    setMatrix((current) => ({ ...current, [role]: { ...current[role], [pageKey]: allowed } }));
  }

  function setRoleAll(role: string, allowed: boolean) {
    setMatrix((current) => {
      const next = { ...current[role] };
      for (const page of PAGES) next[page.key] = allowed;
      return { ...current, [role]: next };
    });
  }

  function toggleBranch(role: string, category: CategoryNode) {
    const keys = category.children;
    if (!keys.length) return;
    const turnOn = aggregate(category, role, matrix) !== 'all';
    setMatrix((current) => {
      const next = { ...current[role] };
      for (const page of keys) next[page.key] = turnOn;
      return { ...current, [role]: next };
    });
  }

  async function save() {
    setSaving(true);
    setNotice('');
    try {
      const rows = COLUMNS.flatMap((column) => PAGES.map((page) => ({
        role: column.value,
        page_key: page.key,
        allowed: !!matrix[column.value]?.[page.key],
      })));
      const { error } = await supabase.from('em_role_page_access').upsert(rows, { onConflict: 'role,page_key' });
      if (error) throw error;
      setSaved(matrix);
      setNotice('Permissions saved.', 'success');
    } catch (err) {
      setNotice(errorText(err, 'Could not save permissions.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="perm-screen">
      <header className="perm-head">
        <div>
          <h1>
            <Icon kind="shield" />
            Permissions
            {dirty ? <span className="perm-unsaved">Unsaved</span> : null}
          </h1>
          <p>Choose which learning pages each level can open. Staff management, Permissions and Licences are reserved for Super Admin.</p>
        </div>
        <div className="perm-actions">
          <button type="button" disabled={loading || saving} onClick={() => { setMatrix(defaultMatrix()); setNotice(''); }}>
            <Icon kind="repeat" /> Reset to defaults
          </button>
          <button type="button" className="go" disabled={loading || saving || !dirty} onClick={() => void save()}>
            {saving ? 'Savingâ€¦' : 'Save permissions'}
          </button>
        </div>
      </header>
      {notice ? <p className={`notice ${noticeTone}`} role={noticeTone === 'error' ? 'alert' : 'status'}>{notice}</p> : null}
      {loadError ? <p className="notice error" role="alert">Could not load permissions. {loadError} <button type="button" onClick={() => void load()}>Retry</button></p> : null}
      <section className="perm-board" aria-busy={loading}>
        {loading ? <p className="perm-loading">Loading permissionsâ€¦</p> : (
          <div className="perm-scroll">
            <table className="perm-grid">
              <thead>
                <tr>
                  <th><span className="perm-corner"><Icon kind="users" /> Category / page</span></th>
                  {COLUMNS.map((column) => {
                    const tone = `perm-col perm-col-${column.value}`;
                    return (
                      <th key={column.value} className={tone}>
                        <span className="perm-bar" />
                        {column.hint ? <span className="perm-hint">{column.hint}</span> : null}
                        <strong>{column.label}</strong>
                        <span className="perm-bulk">
                          <button type="button" className="perm-mini on" onClick={() => setRoleAll(column.value, true)}>All</button>
                          <button type="button" className="perm-mini" onClick={() => setRoleAll(column.value, false)}>None</button>
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {TREE.map((category) => (
                  <Fragment key={category.key}>
                    <tr className="perm-branch">
                      <td>
                        <button type="button" className="perm-folder" aria-expanded={!!open[category.key]} onClick={() => setOpen((current) => ({ ...current, [category.key]: !current[category.key] }))}>
                          <Icon kind="next" />
                          {category.label}
                          <small>category</small>
                        </button>
                      </td>
                      {COLUMNS.map((column) => (
                        <td key={column.value} className={`perm-col perm-col-${column.value}`}>
                          <TriBox
                            state={aggregate(category, column.value, matrix)}
                            label={`${category.label} for ${column.label}`}
                            onChange={() => toggleBranch(column.value, category)}
                          />
                        </td>
                      ))}
                    </tr>
                    {open[category.key] ? category.children.map((page) => (
                      <tr key={page.key}>
                        <td className="perm-page">{page.label}</td>
                        {COLUMNS.map((column) => (
                          <td key={column.value} className={`perm-col perm-col-${column.value}`}>
                            <input
                              type="checkbox"
                              checked={pageOn(page, column.value, matrix)}
                              aria-label={`${page.label} for ${column.label}`}
                              onChange={(event) => setGrant(column.value, page.key, event.target.checked)}
                            />
                          </td>
                        ))}
                      </tr>
                    )) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function TriBox({ state, label, onChange }: { state: string; label: string; onChange: () => void }) {
  const box = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (box.current) box.current.indeterminate = state === 'some';
  }, [state]);
  return (
    <input
      ref={box}
      type="checkbox"
      checked={state === 'all'}
      aria-label={label}
      onChange={onChange}
    />
  );
}
