import Link from 'next/link';

export default function SettingsPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">SETTINGS</div>
          <h1>Settings</h1>
          <p className="lead">Manage your account preferences and notification controls.</p>
        </div>
        <Link href="/profile" className="secondary-btn">Profile</Link>
      </div>

      <div className="profile-panel" style={{ maxWidth: 760 }}>
        <div className="form-grid">
          <div className="checkbox-row">
            <input type="checkbox" id="email" defaultChecked />
            <label htmlFor="email">Email notifications</label>
          </div>
          <div className="checkbox-row">
            <input type="checkbox" id="community" defaultChecked />
            <label htmlFor="community">Community updates</label>
          </div>
          <div className="checkbox-row">
            <input type="checkbox" id="marketplace" />
            <label htmlFor="marketplace">Marketplace alerts</label>
          </div>
          <button className="primary-btn">Save preferences</button>
        </div>
      </div>
    </main>
  );
}
