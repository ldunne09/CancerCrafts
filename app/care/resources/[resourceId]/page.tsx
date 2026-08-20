import Link from 'next/link';

const resource = {
  id: 1,
  title: 'Cancer Support Center',
  type: 'Support',
  city: 'Seattle, WA',
  website: 'https://example.org/support',
  description: 'Peer mentoring, practical care coordination, and local guidance for patients and caregivers managing treatment and recovery.',
  details: [
    'One-on-one peer support calls',
    'Caregiver guidance and checklists',
    'Local workshops and community events',
    'Resource referral help',
  ],
};

export default function ResourceDetailPage() {
  return (
    <main className="page">
      <div className="breadcrumbs">CARE / Resources / Details</div>
      <div className="page-header">
        <div>
          <h1>{resource.title}</h1>
          <p className="lead">{resource.type} • {resource.city}</p>
        </div>
        <Link href="/care/resources" className="secondary-btn">Back to resources</Link>
      </div>

      <div className="profile-grid">
        <div className="profile-panel">
          <div className="thumb" style={{ minHeight: 220 }} />
        </div>
        <div className="profile-panel">
          <p>{resource.description}</p>
          <ul style={{ lineHeight: 1.9, color: 'var(--muted)', paddingLeft: 18 }}>
            {resource.details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="actions-row">
            <a href={resource.website} target="_blank" rel="noreferrer" className="primary-btn">Visit website</a>
            <button className="secondary-btn">Save resource</button>
          </div>
        </div>
      </div>
    </main>
  );
}
