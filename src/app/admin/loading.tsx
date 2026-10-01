export default function AdminLoading() {
  return (
    <div className="admin-loading" aria-busy="true" aria-live="polite">
      <p className="admin-kicker">Loading</p>
      <div className="admin-loading-title" />
      <div className="admin-loading-line" />
      <div className="admin-loading-grid">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
