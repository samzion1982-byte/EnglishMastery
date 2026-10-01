import { fetchAll } from './fetch-all';
import { createBrowserSupabase } from './supabase';
import { phraseOf } from './vocab';

export type AppendixCategory = {
  id: string;
  parentId: string | null;
  name: string;
  sortOrder: number;
  enabled: boolean;
};

export type AppendixNode = AppendixCategory & { children: AppendixNode[] };

type Row = {
  id: string;
  parent_id: string | null;
  name: string;
  sort_order: number;
  is_enabled: boolean;
};

function fromRow(row: Row): AppendixCategory {
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    sortOrder: row.sort_order,
    enabled: row.is_enabled,
  };
}

export function treeOf(rows: AppendixCategory[]): AppendixNode[] {
  const byParent = new Map<string | null, AppendixCategory[]>();
  for (const row of rows) {
    const key = row.parentId;
    const list = byParent.get(key) ?? [];
    list.push(row);
    byParent.set(key, list);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  function branch(parentId: string | null): AppendixNode[] {
    return (byParent.get(parentId) ?? []).map((row) => ({ ...row, children: branch(row.id) }));
  }
  return branch(null);
}

export function countDeep(node: AppendixNode): number {
  return node.children.reduce((sum, child) => sum + 1 + countDeep(child), 0);
}

export async function fetchAppendixCategories() {
  const sb = createBrowserSupabase();
  const { data, error } = await sb
    .from('appendix_categories')
    .select('id, parent_id, name, sort_order, is_enabled')
    .order('sort_order')
    .order('name');
  if (error) throw new Error(error.message);
  return (data as Row[]).map(fromRow);
}

export async function addAppendixCategory(name: string, parentId: string | null, after: AppendixCategory[]) {
  const label = name.trim();
  if (!label) throw new Error('Enter a name.');
  const sortOrder = after.reduce((max, row) => Math.max(max, row.sortOrder), 0) + 1;
  const sb = createBrowserSupabase();
  const { data, error } = await sb
    .from('appendix_categories')
    .insert({ parent_id: parentId, name: label, sort_order: sortOrder, is_enabled: true })
    .select('id, parent_id, name, sort_order, is_enabled')
    .single();
  if (error) throw new Error(error.message.includes('appendix_categories_sibling_name') ? 'That name is already used here.' : error.message);
  return fromRow(data as Row);
}

export async function renameAppendixCategory(id: string, name: string) {
  const label = name.trim();
  if (!label) throw new Error('Enter a name.');
  const sb = createBrowserSupabase();
  const { error } = await sb.from('appendix_categories').update({ name: label }).eq('id', id);
  if (error) throw new Error(error.message.includes('appendix_categories_sibling_name') ? 'That name is already used here.' : error.message);
}

export async function setAppendixCategoryEnabled(id: string, enabled: boolean) {
  const sb = createBrowserSupabase();
  const { error } = await sb.from('appendix_categories').update({ is_enabled: enabled }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteAppendixCategory(id: string) {
  const sb = createBrowserSupabase();
  const { error } = await sb.from('appendix_categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Remove every appendix topic and word so a workbook can be imported again. */
export async function flushAppendix() {
  const sb = createBrowserSupabase();
  const { data: itemRows, error: itemReadError } = await fetchAll<{ id: string }>((from, to) =>
    sb.from('appendix_items').select('id').range(from, to),
  );
  if (itemReadError) throw new Error(explainItemError(itemReadError.message));
  for (const group of chunks(itemRows.map((row) => row.id), 200)) {
    const { error } = await sb.from('appendix_items').delete().in('id', group);
    if (error) throw new Error(explainItemError(error.message));
  }

  const { data: categoryRows, error: categoryReadError } = await fetchAll<{ id: string; parent_id: string | null }>((from, to) =>
    sb.from('appendix_categories').select('id, parent_id').range(from, to),
  );
  if (categoryReadError) throw new Error(categoryReadError.message);
  let left = categoryRows;
  while (left.length) {
    const parents = new Set(left.map((row) => row.parent_id).filter((id): id is string => !!id));
    const leaves = left.filter((row) => !parents.has(row.id)).map((row) => row.id);
    if (!leaves.length) throw new Error('The appendix topics could not be removed.');
    for (const group of chunks(leaves, 200)) {
      const { error } = await sb.from('appendix_categories').delete().in('id', group);
      if (error) throw new Error(error.message);
    }
    const gone = new Set(leaves);
    left = left.filter((row) => !gone.has(row.id));
  }
}

function siblingKey(parentId: string | null, name: string) {
  return `${parentId ?? ''}::${name.toLowerCase()}`;
}

/** Create missing categories from an Excel path list. Existing names are reused. */
export async function importAppendixPaths(paths: Array<{ names: string[]; enabled: boolean }>) {
  const rows = await fetchAppendixCategories();
  const index = new Map(rows.map((row) => [siblingKey(row.parentId, row.name), row]));
  const siblingMax = new Map<string, number>();
  for (const row of rows) {
    const key = row.parentId ?? '';
    siblingMax.set(key, Math.max(siblingMax.get(key) ?? 0, row.sortOrder));
  }

  const planned: Array<{ parentPath: string[]; name: string; enabled: boolean }> = [];
  const seen = new Set<string>();
  for (const path of paths) {
    const names = path.names.map((n) => n.trim()).filter(Boolean);
    for (let i = 0; i < names.length; i += 1) {
      const parentPath = names.slice(0, i);
      const name = names[i];
      const id = [...parentPath, name].join('\0').toLowerCase();
      if (seen.has(id)) continue;
      seen.add(id);
      planned.push({ parentPath, name, enabled: i === names.length - 1 ? path.enabled : true });
    }
  }

  const sb = createBrowserSupabase();
  let added = 0;
  let updated = 0;
  const pathId = new Map<string, string>();

  function idOf(path: string[]): string | null {
    if (!path.length) return null;
    const found = pathId.get(path.join('\0').toLowerCase());
    if (found) return found;
    let parentId: string | null = null;
    for (const name of path) {
      const hit = index.get(siblingKey(parentId, name));
      if (!hit) return null;
      parentId = hit.id;
    }
    return parentId;
  }

  for (const item of planned) {
    const parentId = idOf(item.parentPath);
    if (item.parentPath.length && !parentId) continue;
    const key = siblingKey(parentId, item.name);
    const existing = index.get(key);
    if (existing) {
      pathId.set([...item.parentPath, item.name].join('\0').toLowerCase(), existing.id);
      if (existing.enabled !== item.enabled) {
        const { error } = await sb.from('appendix_categories').update({ is_enabled: item.enabled }).eq('id', existing.id);
        if (error) throw new Error(error.message);
        existing.enabled = item.enabled;
        updated += 1;
      }
      continue;
    }
    const family = parentId ?? '';
    const sortOrder = (siblingMax.get(family) ?? 0) + 1;
    siblingMax.set(family, sortOrder);
    const { data, error } = await sb
      .from('appendix_categories')
      .insert({ parent_id: parentId, name: item.name, sort_order: sortOrder, is_enabled: item.enabled })
      .select('id, parent_id, name, sort_order, is_enabled')
      .single();
    if (error) throw new Error(error.message.includes('appendix_categories_sibling_name') ? `“${item.name}” is already used under that parent.` : error.message);
    const created = fromRow(data as Row);
    index.set(key, created);
    pathId.set([...item.parentPath, item.name].join('\0').toLowerCase(), created.id);
    added += 1;
  }

  return { added, updated, total: (await fetchAppendixCategories()).length };
}

export type AppendixItem = {
  id: string;
  categoryId: string;
  lemma: string;
  displayWord: string;
  sortOrder: number;
  status: 'published' | 'retired';
};

/** Category path plus the word to file at the end of that path. */
export type AppendixWordDraft = { names: string[]; word: string };

type ItemRow = {
  id: string;
  category_id: string;
  lemma: string;
  display_word: string;
  sort_order: number;
  status: 'published' | 'retired';
};

/** Lookup key. Accents fold so “sauté” matches the dictionary as “saute”. Spaces stay, so phrases stay phrases. */
/** Spellings to try when the sheet form is a hyphen, a space, or a note in brackets. */
export function appendixLookupKeys(lemma: string) {
  const keys: string[] = [];
  const add = (value: string) => {
    const key = value.replace(/\s+/g, ' ').trim();
    if (key.length >= 2 && !keys.includes(key)) keys.push(key);
  };
  add(lemma);
  add(lemma.replace(/\([^)]*\)/g, ' '));
  if (lemma.includes('-')) {
    add(lemma.replace(/-/g, ' '));
    add(lemma.replace(/-/g, ''));
  }
  if (lemma.includes(' ')) add(lemma.replace(/ /g, '-'));
  return keys;
}

export function appendixLemma(raw: string) {
  const folded = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return phraseOf(folded);
}

export function wordsFromText(text: string) {
  const seen = new Set<string>();
  const out: { lemma: string; display: string }[] = [];
  for (const line of text.split(/\n+/)) {
    const display = line.replace(/^\d+[).:-]\s*/, '').replace(/\s+/g, ' ').trim().slice(0, 160);
    const lemma = appendixLemma(display);
    if (lemma.length < 2 || seen.has(lemma)) continue;
    seen.add(lemma);
    out.push({ lemma, display });
  }
  return out;
}

function fromItem(row: ItemRow): AppendixItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    lemma: row.lemma,
    displayWord: row.display_word,
    sortOrder: row.sort_order,
    status: row.status,
  };
}

function explainItemError(message: string) {
  if (/appendix_items|schema cache|appendix_category_visible/i.test(message)) {
    return 'Appendix words are not in the database yet. Run the latest migration, then try again.';
  }
  if (/appendix_items_place_key|duplicate key/i.test(message)) return 'That word is already in this category.';
  return message;
}

export function pathOf(rows: AppendixCategory[], id: string) {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const path: AppendixCategory[] = [];
  const guard = new Set<string>();
  let current = byId.get(id);
  while (current && !guard.has(current.id)) {
    guard.add(current.id);
    path.push(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path.reverse();
}

export function subtreeIds(rows: AppendixCategory[], rootId: string) {
  const ids = new Set<string>([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const row of rows) {
      if (row.parentId && ids.has(row.parentId) && !ids.has(row.id)) {
        ids.add(row.id);
        grew = true;
      }
    }
  }
  return ids;
}

export async function fetchAppendixItems(scope: 'all' | 'published' = 'published') {
  const sb = createBrowserSupabase();
  const { data, error } = await fetchAll<ItemRow>((from, to) => {
    let query = sb.from('appendix_items').select('id, category_id, lemma, display_word, sort_order, status');
    if (scope === 'published') query = query.eq('status', 'published');
    return query.order('sort_order').order('display_word').range(from, to);
  });
  if (error) throw new Error(explainItemError(error.message));
  return data.map(fromItem);
}

export async function countAppendixItems() {
  const sb = createBrowserSupabase();
  const { count, error } = await sb.from('appendix_items').select('id', { count: 'exact', head: true }).eq('status', 'published');
  if (error) throw new Error(explainItemError(error.message));
  return count ?? 0;
}

function chunks<T>(list: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/**
 * File words under existing or new categories. Running the same workbook again adds only what is missing.
 * Words already filed, including ones left out of a later file, stay where they are.
 */
export async function importAppendixWords(drafts: AppendixWordDraft[], onProgress?: (done: number, total: number) => void) {
  const paths: Array<{ names: string[]; enabled: boolean }> = [];
  const seenPath = new Set<string>();
  for (const draft of drafts) {
    const names = draft.names.map((name) => name.trim()).filter(Boolean);
    for (let i = 0; i < names.length; i += 1) {
      const key = names.slice(0, i + 1).join('\0').toLowerCase();
      if (seenPath.has(key)) continue;
      seenPath.add(key);
      paths.push({ names: names.slice(0, i + 1), enabled: true });
    }
  }
  await importAppendixPaths(paths);

  const categories = await fetchAppendixCategories();
  const index = new Map(categories.map((row) => [siblingKey(row.parentId, row.name), row]));
  const items = await fetchAppendixItems('all');
  const placed = new Set(items.map((item) => `${item.categoryId}::${item.lemma}`));
  const nextOrder = new Map<string, number>();
  for (const item of items) nextOrder.set(item.categoryId, Math.max(nextOrder.get(item.categoryId) ?? 0, item.sortOrder));

  function idOf(names: string[]) {
    let parentId: string | null = null;
    for (const name of names) {
      const hit = index.get(siblingKey(parentId, name));
      if (!hit) return null;
      parentId = hit.id;
    }
    return parentId;
  }

  const pending: Array<{ category_id: string; lemma: string; display_word: string; sort_order: number; status: 'published' }> = [];
  let skipped = 0;
  for (const draft of drafts) {
    const names = draft.names.map((name) => name.trim()).filter(Boolean);
    const display = draft.word.replace(/\s+/g, ' ').trim().slice(0, 160);
    const lemma = appendixLemma(display);
    const categoryId = idOf(names);
    if (!names.length || !categoryId || lemma.length < 2) {
      skipped += 1;
      continue;
    }
    const key = `${categoryId}::${lemma}`;
    if (placed.has(key)) {
      skipped += 1;
      continue;
    }
    placed.add(key);
    const sortOrder = (nextOrder.get(categoryId) ?? 0) + 1;
    nextOrder.set(categoryId, sortOrder);
    pending.push({ category_id: categoryId, lemma, display_word: display, sort_order: sortOrder, status: 'published' });
  }

  const sb = createBrowserSupabase();
  let added = 0;
  const groups = chunks(pending, 200);
  for (const group of groups) {
    const { error } = await sb.from('appendix_items').upsert(group, { onConflict: 'category_id,lemma', ignoreDuplicates: true });
    if (error) throw new Error(explainItemError(error.message));
    added += group.length;
    onProgress?.(added, pending.length);
  }
  const removed = await dropMisfiledWordCategories(drafts);
  return { added, skipped, total: placed.size, removed };
}

/**
 * Category ids that were created by reading a word workbook as a category tree.
 * The real topic path from the workbook is kept. A leaf whose name is one of the words, and any parent that contains only those leaves, is not.
 */
export function misfiledCategoryIds(categories: AppendixCategory[], drafts: AppendixWordDraft[]) {
  const index = new Map(categories.map((row) => [siblingKey(row.parentId, row.name), row]));
  const byId = new Map(categories.map((row) => [row.id, row]));
  const children = new Map<string, AppendixCategory[]>();
  for (const row of categories) {
    if (!row.parentId) continue;
    const list = children.get(row.parentId) ?? [];
    list.push(row);
    children.set(row.parentId, list);
  }

  const correct = new Set<string>();
  for (const draft of drafts) {
    let parentId: string | null = null;
    for (const name of draft.names.map((part) => part.trim()).filter(Boolean)) {
      const hit = index.get(siblingKey(parentId, name));
      if (!hit) break;
      correct.add(hit.id);
      parentId = hit.id;
    }
  }

  const wordNames = new Set(drafts.map((draft) => draft.word.trim().toLowerCase()).filter(Boolean));
  const misfiled = new Set<string>();

  function mark(id: string): boolean {
    const kids = children.get(id) ?? [];
    if (correct.has(id)) {
      kids.forEach((kid) => mark(kid.id));
      return false;
    }
    const row = byId.get(id);
    if (!row) return false;
    if (!kids.length) {
      const yes = wordNames.has(row.name.toLowerCase());
      if (yes) misfiled.add(id);
      return yes;
    }
    const allKids = kids.every((kid) => mark(kid.id));
    if (allKids) misfiled.add(id);
    return allKids;
  }

  for (const row of categories) {
    if (!row.parentId) mark(row.id);
  }

  return [...misfiled].filter((id) => {
    const parentId = byId.get(id)?.parentId;
    return !parentId || !misfiled.has(parentId);
  });
}

async function dropMisfiledWordCategories(drafts: AppendixWordDraft[]) {
  const ids = misfiledCategoryIds(await fetchAppendixCategories(), drafts);
  if (!ids.length) return 0;
  const sb = createBrowserSupabase();
  for (const group of chunks(ids, 80)) {
    const { error } = await sb.from('appendix_categories').delete().in('id', group);
    if (error) throw new Error(error.message);
  }
  return ids.length;
}

export async function addAppendixWords(categoryId: string, text: string) {
  const words = wordsFromText(text);
  if (!words.length) throw new Error('Enter at least one word or phrase, one on each line.');
  const items = await fetchAppendixItems('all');
  const here = new Set(items.filter((item) => item.categoryId === categoryId).map((item) => item.lemma));
  let sortOrder = items.filter((item) => item.categoryId === categoryId).reduce((max, item) => Math.max(max, item.sortOrder), 0);
  const pending = words
    .filter((word) => !here.has(word.lemma))
    .map((word) => {
      sortOrder += 1;
      return { category_id: categoryId, lemma: word.lemma, display_word: word.display, sort_order: sortOrder, status: 'published' as const };
    });
  if (!pending.length) throw new Error('Those words are already in this category.');
  const sb = createBrowserSupabase();
  const { error } = await sb.from('appendix_items').insert(pending);
  if (error) throw new Error(explainItemError(error.message));
  return { added: pending.length, skipped: words.length - pending.length };
}

export async function moveAppendixItems(ids: string[], categoryId: string) {
  const wanted = new Set(ids);
  if (!wanted.size) return { moved: 0, skipped: 0 };
  const items = await fetchAppendixItems('all');
  const taken = new Set(items.filter((item) => item.categoryId === categoryId).map((item) => item.lemma));
  let sortOrder = items.filter((item) => item.categoryId === categoryId).reduce((max, item) => Math.max(max, item.sortOrder), 0);
  const moving: AppendixItem[] = [];
  for (const item of items) {
    if (!wanted.has(item.id) || item.categoryId === categoryId || taken.has(item.lemma)) continue;
    taken.add(item.lemma);
    moving.push(item);
  }
  const skipped = ids.length - moving.length;
  const sb = createBrowserSupabase();
  for (const group of chunks(moving, 80)) {
    sortOrder += 1;
    const { error } = await sb
      .from('appendix_items')
      .update({ category_id: categoryId, sort_order: sortOrder })
      .in(
        'id',
        group.map((item) => item.id),
      );
    if (error) throw new Error(explainItemError(error.message));
  }
  return { moved: moving.length, skipped };
}

export async function deleteAppendixItems(ids: string[]) {
  if (!ids.length) return;
  const sb = createBrowserSupabase();
  const { error } = await sb.from('appendix_items').delete().in('id', ids);
  if (error) throw new Error(explainItemError(error.message));
}

export async function reorderAppendixCategories(parentId: string | null, ids: string[]) {
  const sb = createBrowserSupabase();
  await Promise.all(
    ids.map((id, i) =>
      sb
        .from('appendix_categories')
        .update({ sort_order: i + 1, parent_id: parentId })
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw new Error(error.message);
        }),
    ),
  );
}
