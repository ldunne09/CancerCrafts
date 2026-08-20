export default function AdminReportsPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">ADMIN / Reports</div>
          <h1>Moderation queue</h1>
        </div>
      </div>
      <div className="profile-panel">
        <div className="list-row"><div><strong>Post flagged for harassment</strong><div className="meta">Priority high • pending review</div></div><button className="mini-btn">Resolve</button></div>
        <div className="list-row"><div><strong>Product listing concern</strong><div className="meta">Priority mid • pending review</div></div><button className="mini-btn">Resolve</button></div>
      </div>
    </main>
  );
}
