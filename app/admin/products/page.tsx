export default function AdminProductsPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">ADMIN / Products</div>
          <h1>Marketplace listings</h1>
        </div>
      </div>
      <div className="profile-panel">
        <div className="list-row"><div><strong>Handmade comfort basket</strong><div className="meta">Live • $42</div></div><button className="mini-btn">Review</button></div>
        <div className="list-row"><div><strong>Virtual planning session</strong><div className="meta">Pending • $35</div></div><button className="mini-btn">Review</button></div>
      </div>
    </main>
  );
}
