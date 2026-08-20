import Link from 'next/link';

const activity = [
  { label: 'Community post', value: 'A shared ride list for weekly treatment visits' },
  { label: 'Marketplace item', value: 'Handmade comfort basket listed for sale' },
  { label: 'Assistance support', value: 'Donated $25 to a local transportation request' },
];

export default function ProfilePage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">PROFILE</div>
          <h1>Profile</h1>
          <p className="lead">Track your activity, profile, and support impact.</p>
        </div>
        <Link href="/profile/edit" className="primary-btn">Edit profile</Link>
      </div>

      <div className="profile-grid">
        <div className="profile-panel">
          <div className="user-badge" style={{ marginBottom: 16 }}>
            <div className="avatar" style={{ width: 60, height: 60 }}>JS</div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Jordan Smith</div>
              <div className="meta">patient • Seattle, WA</div>
            </div>
          </div>
          <p>Looking for practical support, neighborhood guidance, and small ways to connect with others navigating treatment.</p>
          <div className="summary-box">
            <div>
              <span className="meta">Posts</span>
              <strong>18</strong>
            </div>
            <div>
              <span className="meta">Support given</span>
              <strong>7</strong>
            </div>
            <div>
              <span className="meta">Sales</span>
              <strong>$240</strong>
            </div>
          </div>
        </div>

        <div className="profile-panel">
          <h3>Recent activity</h3>
          <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
            {activity.map((item) => (
              <div key={item.label} className="list-row">
                <div>
                  <strong>{item.label}</strong>
                  <div className="meta" style={{ marginTop: 4 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
