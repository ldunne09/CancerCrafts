export default function AdminPostsPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">ADMIN / Posts</div>
          <h1>Community posts</h1>
        </div>
      </div>
      <div className="profile-panel">
        <div className="list-row"><div><strong>Meal ideas for low-energy days</strong><div className="meta">Nutrition • 12 reports</div></div><button className="mini-btn">Review</button></div>
        <div className="list-row"><div><strong>Local rideshare coordination</strong><div className="meta">Transportation • 4 reports</div></div><button className="mini-btn">Review</button></div>
      </div>
    </main>
  );
}
