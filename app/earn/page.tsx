import Link from 'next/link';

const products = [
  { id: 1, title: 'Handmade Comfort Basket', price: '$42', seller: 'Sierra', description: 'A small basket of calming essentials for treatment days and recovery.' },
  { id: 2, title: 'Virtual Etsy-style Craft Pack', price: '$18', seller: 'Aria', description: 'DIY wellness kits created by patients and survivors for home use.' },
  { id: 3, title: 'Custom Meal Prep Support', price: '$28', seller: 'Nora', description: 'Simple family-size meal prep planning sessions for busy households.' },
];

export default function EarnPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">EARN / Marketplace</div>
          <h1>EARN</h1>
          <p className="lead">Flexible ways to support your household while sharing skills and goods.</p>
        </div>
        <Link href="/earn/sell" className="primary-btn">Sell something</Link>
      </div>

      <div className="profile-grid">
        <aside className="profile-panel">
          <h3>Marketplace</h3>
          <div className="nav" style={{ padding: 0, display: 'grid', justifyContent: 'stretch' }}>
            <Link href="/earn/marketplace" className="active">Marketplace</Link>
            <Link href="/earn/my-listings">My listings</Link>
            <Link href="/earn/sell">Sell something</Link>
          </div>
        </aside>

        <section style={{ display: 'grid', gap: 18 }}>
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <div className="image" aria-hidden="true" />
              <div className="tag">Marketplace</div>
              <h3>{product.title}</h3>
              <p>{product.description}</p>
              <div className="list-row" style={{ paddingBottom: 0 }}>
                <div className="price">{product.price}</div>
                <div className="meta">by {product.seller}</div>
              </div>
              <div className="actions-row">
                <Link href={`/earn/marketplace/${product.id}`} className="primary-btn">View item</Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
