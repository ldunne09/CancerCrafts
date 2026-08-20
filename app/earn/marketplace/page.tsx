import Link from 'next/link';

const products = [
  { id: 1, title: 'Handmade Comfort Basket', price: '$42', seller: 'Sierra', category: 'Care kits', location: 'Portland, OR' },
  { id: 2, title: 'Custom Candle Set', price: '$28', seller: 'Aria', category: 'Wellbeing', location: 'Phoenix, AZ' },
  { id: 3, title: 'Virtual Planning Session', price: '$35', seller: 'Nora', category: 'Support services', location: 'Remote' },
];

export default function MarketplacePage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">EARN / Marketplace</div>
          <h1>Marketplace</h1>
          <p className="lead">Browse products and services made by patients, survivors, and supporters.</p>
        </div>
        <Link href="/earn/sell" className="primary-btn">List an item</Link>
      </div>

      <div className="card-grid">
        {products.map((product) => (
          <article key={product.id} className="product-card">
            <div className="image" aria-hidden="true" />
            <div className="tag">{product.category}</div>
            <h3>{product.title}</h3>
            <div className="list-row" style={{ padding: 0, marginTop: 8 }}>
              <div className="price">{product.price}</div>
              <div className="meta">{product.location}</div>
            </div>
            <div className="actions-row">
              <Link href={`/earn/marketplace/${product.id}`} className="primary-btn">View details</Link>
              <Link href={`/earn/sellers/${product.seller.toLowerCase()}`} className="secondary-btn">Seller</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
