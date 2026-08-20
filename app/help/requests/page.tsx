import Link from 'next/link';

const requests = [
  { id: 1, title: 'Transportation to treatment', amount: '$800', raised: '$520', category: 'Transportation' },
  { id: 2, title: 'Meal support for recovery week', amount: '$500', raised: '$370', category: 'Meals' },
  { id: 3, title: 'Home essentials fund', amount: '$1,200', raised: '$910', category: 'Household' },
];

export default function RequestsPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">HELP / Requests</div>
          <h1>Assistance requests</h1>
          <p className="lead">Give practical help or find support for a specific need.</p>
        </div>
        <Link href="/help/requests/create" className="primary-btn">Create request</Link>
      </div>

      <div className="card-grid">
        {requests.map((request) => (
          <article key={request.id} className="request-card">
            <div className="tag">{request.category}</div>
            <h3>{request.title}</h3>
            <div className="progress"><span style={{ width: `${(Number(request.raised.replace(/[$,]/g, '')) / Number(request.amount.replace(/[$,]/g, ''))) * 100}%` }} /></div>
            <div className="list-row" style={{ padding: 0 }}>
              <div><strong>{request.raised}</strong> raised</div>
              <div className="meta">Goal {request.amount}</div>
            </div>
            <div className="actions-row">
              <Link href={`/help/requests/${request.id}`} className="primary-btn">View request</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
