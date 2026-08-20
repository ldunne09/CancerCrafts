import Link from 'next/link';

const seller = {
  name: 'Sierra',
  city: 'Portland, OR',
  bio: 'I design handmade comfort items and practical care kits for patients, caregivers, and families navigating treatment.',
  products: ['Comfort basket', 'Tea set', 'Care kit starter pack'],
};

export default function SellerProfilePage() {
  return (
    <main className="page">
      <div className="breadcrumbs">EARN / Seller profile</div>
      <div className="page-header">
        <div>
          <h1>{seller.name}</h1>
          <p className="lead">{seller.city}</p>
        </div>
        <Link href="/earn/marketplace" className="secondary-btn">Back to listings</Link>
      </div>

      <div className="profile-grid">
        <div className="profile-panel">
          <div className="avatar" style={{ width: 72, height: 72, fontSize: '1.5rem', marginBottom: 14 }}>{seller.name.charAt(0)}</div>
          <p>{seller.bio}</p>
        </div>
        <div className="profile-panel">
          <h3>Products</h3>
          <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
            {seller.products.map((product) => (
              <div key={product} className="list-row">
                <strong>{product}</strong>
                <button className="mini-btn">View</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
