export default function AdminResourcesPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">ADMIN / Resources</div>
          <h1>Resource directory</h1>
        </div>
      </div>
      <div className="profile-panel">
        <div className="list-row"><div><strong>Cancer Support Center</strong><div className="meta">Support • active</div></div><button className="mini-btn">Review</button></div>
        <div className="list-row"><div><strong>Ride for Treatment</strong><div className="meta">Transportation • active</div></div><button className="mini-btn">Review</button></div>
      </div>
    </main>
  );
}
