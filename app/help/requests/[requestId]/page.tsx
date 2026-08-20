import Link from 'next/link';

const request = {
  id: 1,
  title: 'Transportation to treatment',
  category: 'Transportation',
  amount: '$800',
  raised: '$520',
  description: 'Covering weekly treatment drives and occasional rides for appointments, lab work, and infusion center visits.',
  updates: ['Ride coordination is now set for the next three weeks.', 'Community support has covered most of the fuel costs.'],
};

export default function RequestDetailPage() {
  return (
    <main className="page">
      <div className="breadcrumbs">HELP / Requests / Details</div>
      <div className="page-header">
        <div>
          <h1>{request.title}</h1>
          <p className="lead">{request.category}</p>
        </div>
        <Link href="/help/requests" className="secondary-btn">Back to requests</Link>
      </div>

      <div className="profile-grid">
        <div className="profile-panel">
          <div className="tag">Goal {request.amount}</div>
          <div className="progress"><span style={{ width: `${(Number(request.raised.replace(/[$,]/g, '')) / Number(request.amount.replace(/[$,]/g, ''))) * 100}%` }} /></div>
          <div className="list-row" style={{ padding: 0 }}>
            <div><strong>{request.raised}</strong> raised</div>
            <div className="meta">{request.amount} goal</div>
          </div>
          <p style={{ marginTop: 16 }}>{request.description}</p>
          <div className="actions-row">
            <button className="primary-btn">Donate</button>
            <button className="secondary-btn">Share</button>
          </div>
        </div>

        <div className="profile-panel">
          <h3>Updates</h3>
          <ul style={{ lineHeight: 1.9, color: 'var(--muted)', paddingLeft: 18 }}>
            {request.updates.map((update) => (
              <li key={update}>{update}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
