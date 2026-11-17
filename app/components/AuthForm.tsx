'use client';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { authClient } from '@/lib/auth-client';

export default function AuthForm({ signup = false, verificationRequired = false }: { signup?: boolean; verificationRequired?: boolean }) {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [checkInbox, setCheckInbox] = useState(false);
  const [unverified, setUnverified] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    setUnverified(false);
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email')).trim().toLowerCase();
    const password = String(form.get('password'));
    try {
      const result = signup
        ? await authClient.signUp.email({ email, password, name: String(form.get('name')).trim(), role: String(form.get('role')) as 'patient' | 'survivor' | 'caregiver' | 'supporter', callbackURL: '/verify-email?verified=1' })
        : await authClient.signIn.email({ email, password, rememberMe: form.has('remember') });
      if (result.error) {
        setUnverified(result.error.code === 'EMAIL_NOT_VERIFIED');
        setError(result.error.status >= 500 ? 'We could not reach the account service. Please try again shortly.' : result.error.message || 'Unable to continue. Please check your details.');
        setPending(false);
        return;
      }
      if (signup && verificationRequired) {
        setCheckInbox(true);
        setPending(false);
        return;
      }
      window.location.assign('/care');
    } catch {
      setError('Unable to connect. Please check your connection and try again.');
      setPending(false);
    }
  }
  if (checkInbox) return <main className="page"><div className="profile-panel" role="status">
    <h1>Check your inbox</h1><p>If this email is eligible for registration, we sent a verification link. Open it within 30 minutes, then sign in. Check your spam folder too.</p>
    <p>Already have an account? Sign in or reset your password.</p>
    <div className="actions-row"><Link className="primary-btn" href="/login">Sign in</Link><Link className="secondary-btn" href="/verify-email">Resend verification email</Link><Link className="secondary-btn" href="/forgot-password">Forgot password?</Link></div>
  </div></main>;
  return <main className="page"><div style={{ maxWidth: 620, margin: '0 auto' }}>
    <div className="page-header" style={{ display: 'block', marginBottom: 24 }}>
      <h1>{signup ? 'Create your account' : 'Welcome back'}</h1>
      <p className="lead">{signup ? 'Join the community to share, ask, give, and earn support.' : 'Sign in to access your community, requests, and marketplace.'}</p>
    </div>
    <div className="profile-panel"><form className="form-grid" onSubmit={submit} aria-busy={pending}>
      {signup && <>
        <div className="field"><label htmlFor="name">Display name</label>
          <input id="name" name="name" required minLength={1} maxLength={80} autoComplete="nickname" />
          <span className="meta">Choose the name you want others to see.</span></div>
        <div className="field"><label htmlFor="role">Community role</label>
          <select id="role" name="role" defaultValue="supporter">
            <option value="patient">Patient</option><option value="survivor">Survivor</option>
            <option value="caregiver">Caregiver</option><option value="supporter">Supporter</option>
          </select></div>
      </>}
      <div className="field"><label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" /></div>
      <div className="field"><label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={signup ? 12 : 1} maxLength={128} autoComplete={signup ? 'new-password' : 'current-password'} aria-describedby={signup ? 'password-hint' : undefined} />
        {signup && <span id="password-hint" className="meta">Use 12–128 characters.</span>}</div>
      {!signup && <div className="checkbox-row"><input type="checkbox" id="remember" name="remember" /><label htmlFor="remember">Keep me signed in</label></div>}
      {error && <p role="alert">{error}</p>}
      {unverified && <Link href="/verify-email" className="secondary-btn">Verify your email or resend the link</Link>}
      {signup && verificationRequired && <p className="meta">You will need to verify your email before signing in.</p>}
      <button type="submit" className="primary-btn" disabled={pending}>{pending ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button>
      <div className="meta" style={{ textAlign: 'center' }}>{signup ? 'Already have an account? ' : 'Need an account? '}
        <Link href={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create one'}</Link></div>
      {!signup && <Link href="/forgot-password">Forgot password?</Link>}
      {!signup && verificationRequired && <Link href="/verify-email">Resend verification email</Link>}
    </form></div>
  </div></main>;
}
