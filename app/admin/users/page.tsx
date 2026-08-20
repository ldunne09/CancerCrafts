export default function AdminUsersPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">ADMIN / Users</div>
          <h1>User overview</h1>
        </div>
      </div>
      <div className="profile-panel">
        <div className="list-row"><div><strong>Jordan Smith</strong><div className="meta">patient • active</div></div><button className="mini-btn">Manage</button></div>
        <div className="list-row"><div><strong>Sam Lee</strong><div className="meta">caregiver • active</div></div><button className="mini-btn">Manage</button></div>
        <div className="list-row"><div><strong>Ari Patel</strong><div className="meta">supporter • active</div></div><button className="mini-btn">Manage</button></div>
      </div>
    </main>
  );
}
