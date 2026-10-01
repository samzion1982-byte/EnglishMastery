export function Pagination({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (page: number) => void }) {
  return <nav className="pagination" aria-label="Results pages"><span>{total.toLocaleString()} results · Page {page} of {pages}</span><div><button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button><button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button></div></nav>;
}
