import Link from 'next/link';

const product = {
  id: 1,
  title: 'Handmade Comfort Basket',
  price: '$42',
  seller: 'Sierra',
  category: 'Care kits',
  description: 'A calming basket filled with self-care essentials, comforting tea blends, and thoughtful items to make treatment days feel a little softer.',
  details: ['Includes two tea sachets', 'Handcrafted wooden tray', 'Ships in 3–5 business days'],
};

export default function ProductDetailPage() {
  return (
    <main className="page">
      <div className="breadcrumbs">EARN / Marketplace / Item</div>
      <div className="page-header">
        <div>
          <h1>{product.title}</h1>
          <p className="lead">{product.category} • sold by {product.seller}</p>
        </div>
        <Link href="/earn/marketplace" className="secondary-btn">Back to listings</Link>
      </div>

      <div className="profile-grid">
        <div className="profile-panel">
          <div className="image" style={{ minHeight: 280 }} aria-hidden="true" />
        </div>
        <div className="profile-panel">
          <div className="price" style={{ marginBottom: 12 }}>{product.price}</div>
          <p>{product.description}</p>
          <ul style={{ lineHeight: 1.9, color: 'var(--muted)', paddingLeft: 18 }}>
            {product.details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="actions-row">
            <Link href="/earn/marketplace" className="primary-btn">Buy now</Link>
            <Link href={`/earn/sellers/${product.seller.toLowerCase()}`} className="secondary-btn">View seller</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
