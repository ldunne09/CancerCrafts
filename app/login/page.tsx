import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="page">
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="page-header" style={{ display: 'block', marginBottom: 24 }}>
          <div className="brand" style={{ marginBottom: 14 }}>
            <div className="brand-mark">C</div>
            <span>CancerCrafts</span>
          </div>
          <h1>Welcome back</h1>
          <p className="lead">Sign in to access your community, requests, and marketplace.</p>
        </div>

        <div className="profile-panel">
          <form className="form-grid">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="hello@example.com" defaultValue="sam@example.com" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="••••••••" defaultValue="password123" />
            </div>
            <div className="checkbox-row">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Keep me signed in</label>
            </div>
            <Link href="/care" className="primary-btn" style={{ textAlign: 'center' }}>Sign in</Link>
            <div className="meta" style={{ textAlign: 'center' }}>
              Need an account? <Link href="/signup" style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>Create one</Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
