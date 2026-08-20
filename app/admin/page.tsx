import Link from 'next/link';

const adminCards = [
  { title: 'Users', path: '/admin/users', count: '1,284' },
  { title: 'Posts', path: '/admin/posts', count: '6,420' },
  { title: 'Products', path: '/admin/products', count: '418' },
  { title: 'Assistance', path: '/admin/assistance', count: '161' },
  { title: 'Resources', path: '/admin/resources', count: '84' },
  { title: 'Reports', path: '/admin/reports', count: '23' },
];

export default function AdminPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">ADMIN</div>
          <h1>Admin dashboard</h1>
          <p className="lead">A simple overview of community health and operational activity.</p>
        </div>
      </div>

      <div className="admin-grid">
        {adminCards.map((card) => (
          <Link key={card.title} href={card.path} className="admin-card">
            <div className="meta">{card.title}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '12px 0 6px' }}>{card.count}</div>
            <span className="chip">Open dashboard</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
