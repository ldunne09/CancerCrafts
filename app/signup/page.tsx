import Link from 'next/link';

export default function SignupPage() {
  return (
    <main className="page">
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <div className="page-header" style={{ display: 'block', marginBottom: 24 }}>
          <div className="brand" style={{ marginBottom: 14 }}>
            <div className="brand-mark">C</div>
            <span>CancerCrafts</span>
          </div>
          <h1>Create your account</h1>
          <p className="lead">Join the community to share, ask, give, and earn support.</p>
        </div>

        <div className="profile-panel">
          <form className="form-grid">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" type="text" placeholder="Jordan Smith" defaultValue="Jordan Smith" />
            </div>
            <div className="field">
              <label htmlFor="role">Role</label>
              <select id="role" defaultValue="patient">
                <option value="patient">Patient</option>
                <option value="survivor">Survivor</option>
                <option value="caregiver">Caregiver</option>
                <option value="supporter">Supporter</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="hello@example.com" defaultValue="jordan@example.com" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="Create a password" defaultValue="password123" />
            </div>
            <Link href="/care" className="primary-btn" style={{ textAlign: 'center' }}>Create account</Link>
            <div className="meta" style={{ textAlign: 'center' }}>
              Already have an account? <Link href="/login" style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
