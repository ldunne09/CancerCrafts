'use client';
import Link from 'next/link';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export default function AccountMenu() {
  const { data: session, isPending } = authClient.useSession();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  if (isPending) return <span className="meta">Loading account…</span>;
  if (!session) return <Link href="/login" className="secondary-btn">Sign in</Link>;
  async function signOut() {
    setPending(true);
    setError('');
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error();
      window.location.assign('/login');
    } catch {
      setError('Could not sign out. Please try again.');
      setPending(false);
    }
  }
  return <div>{!session.user.emailVerified && <Link href="/verify-email" className="secondary-btn">Verify email</Link>}<button type="button" className="secondary-btn" disabled={pending} onClick={signOut}>{pending ? 'Signing out…' : 'Sign out'}</button>
    {error && <p role="alert">{error}</p>}</div>;
}
