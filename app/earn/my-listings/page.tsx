import Link from 'next/link';

const listings = [
  { title: 'Handmade comfort basket', status: 'Live', price: '$42' },
  { title: 'Virtual planning session', status: 'Pending', price: '$35' },
  { title: 'Recipe card bundle', status: 'Sold', price: '$18' },
];

export default function MyListingsPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">EARN / My listings</div>
          <h1>My listings</h1>
          <p className="lead">Track current listings, sold items, and pending updates.</p>
        </div>
        <Link href="/earn/sell" className="primary-btn">New listing</Link>
      </div>

      <div className="profile-panel">
        {listings.map((listing) => (
          <div key={listing.title} className="list-row">
            <div>
              <strong>{listing.title}</strong>
              <div className="meta">{listing.status}</div>
            </div>
            <div className="price" style={{ fontSize: '1.2rem' }}>{listing.price}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
