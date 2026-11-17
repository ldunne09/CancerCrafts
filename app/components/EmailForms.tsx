'use client';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { authClient } from '@/lib/auth-client';

export function EmailRequestForm({ purpose, defaultEmail = '', enabled }: { purpose: 'verification' | 'reset'; defaultEmail?: string; enabled: boolean }) {
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    setPending(true); setError(''); setMessage('');
    const email = String(new FormData(event.currentTarget).get('email')).trim().toLowerCase();
    try {
      const result = purpose === 'verification'
        ? await authClient.sendVerificationEmail({ email, callbackURL: '/verify-email?verified=1' })
        : await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' });
      if (result.error) setError(result.error.status === 429 ? 'Too many requests. Wait a minute before trying again.' : 'We could not send this email. Please try again later.');
      else setMessage('If an eligible account exists for this email, we sent a link. Check your inbox and spam folder. The link expires in 30 minutes.');
    } catch { setError('Unable to connect. Please try again.'); }
    finally { setPending(false); }
  }
  if (!enabled) return <p role="status">Email delivery is being set up. Please try again later.</p>;
  return <form className="form-grid" onSubmit={submit} aria-busy={pending}>
    <div className="field"><label htmlFor="account-email">Email</label><input id="account-email" name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={defaultEmail} /></div>
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    <button type="submit" className="primary-btn" disabled={pending}>{pending ? 'Sending…' : purpose === 'verification' ? 'Send verification link' : 'Send password reset link'}</button>
  </form>;
}
export function ResetPasswordForm({ token, invalid, enabled }: { token?: string; invalid: boolean; enabled: boolean }) {
  const [error, setError] = useState(''); const [done, setDone] = useState(false); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    const form = new FormData(event.currentTarget); const password = String(form.get('password'));
    if (password !== form.get('confirm')) { setError('The passwords do not match.'); return; }
    setPending(true); setError('');
    try {
      const result = await authClient.resetPassword({ token, newPassword: password });
      if (result.error) setError('This link may have expired or already been used. Request a new link and try again.');
      else { window.history.replaceState(null, '', '/reset-password'); setDone(true); }
    } catch { setError('Unable to connect. Please try again.'); }
    finally { setPending(false); }
  }
  if (!enabled) return <p>Email delivery is being set up. Please try again later.</p>;
  if (done) return <div role="status"><h2>Password updated</h2><p>Your previous sessions have been signed out. Sign in with your new password.</p><Link className="primary-btn" href="/login">Sign in</Link></div>;
  if (!token || invalid) return <div role="alert"><p>This reset link is missing, invalid, or expired.</p><Link href="/forgot-password" className="secondary-btn">Request a new reset link</Link></div>;
  return <form className="form-grid" onSubmit={submit} aria-busy={pending}>
    <div className="field"><label htmlFor="new-password">New password</label><input type="password" id="new-password" name="password" required minLength={12} maxLength={128} autoComplete="new-password" /></div>
    <div className="field"><label htmlFor="confirm-password">Confirm new password</label><input type="password" id="confirm-password" name="confirm" required minLength={12} maxLength={128} autoComplete="new-password" /></div>
    <p className="meta">Use 12–128 characters.</p>{error && <p role="alert">{error}</p>}
    <button className="primary-btn" type="submit" disabled={pending}>{pending ? 'Saving…' : 'Reset password'}</button>
  </form>;
}
