import Link from 'next/link';

export default function SellPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">EARN / Sell</div>
          <h1>Sell something</h1>
          <p className="lead">List a product or service that supports your community and income goals.</p>
        </div>
        <Link href="/earn/marketplace" className="secondary-btn">View marketplace</Link>
      </div>

      <div className="profile-panel" style={{ maxWidth: 760 }}>
        <form className="form-grid">
          <div className="field">
            <label htmlFor="title">Product or service title</label>
            <input id="title" type="text" defaultValue="Handmade comfort basket" />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" defaultValue="care-kits">
              <option value="care-kits">Care kits</option>
              <option value="wellbeing">Wellbeing</option>
              <option value="support-services">Support services</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="price">Price</label>
            <input id="price" type="text" defaultValue="$42" />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" defaultValue="A calming basket with thoughtful items that help during treatment and recovery weeks." />
          </div>
          <div className="field">
            <label htmlFor="image">Image upload</label>
            <input id="image" type="file" />
          </div>
          <button type="button" className="primary-btn">Publish listing</button>
        </form>
      </div>
    </main>
  );
}
