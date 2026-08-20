import Link from 'next/link';

const requests = [
  { id: 1, title: 'Transportation to treatment', amount: '$800', raised: '$520', description: 'Help cover rides for weekly appointments and infusion days.', category: 'Transportation' },
  { id: 2, title: 'Meal support for recovery week', amount: '$500', raised: '$370', description: 'A meal train and grocery support for recovery after surgery.', category: 'Meals' },
  { id: 3, title: 'Home essentials fund', amount: '$1,200', raised: '$910', description: 'Support for household essentials while adjusting to treatment.', category: 'Household' },
];

export default function HelpPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">HELP / Requests</div>
          <h1>HELP</h1>
          <p className="lead">Create or find assistance for practical needs, donations, and immediate support.</p>
        </div>
        <Link href="/help/requests/create" className="primary-btn">Create request</Link>
      </div>

      <div className="profile-grid">
        <aside className="profile-panel">
          <h3>Need help?</h3>
          <div className="nav" style={{ padding: 0, display: 'grid', justifyContent: 'stretch' }}>
            <Link href="/help/requests" className="active">Find help</Link>
            <Link href="/help/requests/create">Create request</Link>
          </div>
        </aside>

        <section style={{ display: 'grid', gap: 18 }}>
          {requests.map((request) => (
            <article key={request.id} className="request-card">
              <div className="tag">{request.category}</div>
              <h3>{request.title}</h3>
              <p>{request.description}</p>
              <div className="progress"><span style={{ width: `${(Number(request.raised.replace(/[$,]/g, '')) / Number(request.amount.replace(/[$,]/g, ''))) * 100}%` }} /></div>
              <div className="list-row" style={{ padding: 0 }}>
                <div><strong>{request.raised}</strong> raised</div>
                <div className="meta">Goal {request.amount}</div>
              </div>
              <div className="actions-row">
                <Link href={`/help/requests/${request.id}`} className="primary-btn">Support</Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
