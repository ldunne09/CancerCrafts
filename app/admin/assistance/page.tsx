export default function AdminAssistancePage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">ADMIN / Assistance</div>
          <h1>Assistance requests</h1>
        </div>
      </div>
      <div className="profile-panel">
        <div className="list-row"><div><strong>Transportation to treatment</strong><div className="meta">Goal $800 • 65% funded</div></div><button className="mini-btn">Review</button></div>
        <div className="list-row"><div><strong>Meal support for recovery week</strong><div className="meta">Goal $500 • 74% funded</div></div><button className="mini-btn">Review</button></div>
      </div>
    </main>
  );
}
