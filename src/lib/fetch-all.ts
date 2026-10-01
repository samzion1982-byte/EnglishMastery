type Page<T> = { data: T[] | null; error: { message: string } | null };

/** Read every row. PostgREST stops a single response at its page size. */
export async function fetchAll<T>(
  loadPage: (from: number, to: number) => PromiseLike<Page<T>>,
  pageSize = 1000,
): Promise<{ data: T[]; error: { message: string } | null }> {
  const data: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const result = await loadPage(from, from + pageSize - 1);
    if (result.error) return { data: [], error: result.error };
    const rows = result.data ?? [];
    data.push(...rows);
    if (rows.length < pageSize) return { data, error: null };
  }
}
