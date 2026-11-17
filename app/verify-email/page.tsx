import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { emailConfigured } from '@/lib/email';
import { EmailRequestForm } from '@/app/components/EmailForms';
export const metadata = { title: 'Verify email | CancerCrafts', robots: { index: false, follow: false }, referrer: 'no-referrer' as const };
export default async function Page({ searchParams }: { searchParams: Promise<{ verified?: string; error?: string }> }) {
  const [params, session] = await Promise.all([searchParams, headers().then(headers => auth.api.getSession({ headers }))]);
  const verified = !params.error && (params.verified === '1' || session?.user.emailVerified);
  return <main className="page"><div className="profile-panel" style={{ maxWidth: 680 }}>
    <h1>{verified ? 'Verification link processed' : 'Verify your email'}</h1>
    {verified ? session?.user.emailVerified ? <><p>Your email is verified.</p><Link className="primary-btn" href="/care">Continue to CARE</Link></> : <><p>Sign in with your password to continue. If your email is still unverified, request a new verification link.</p>{!session && <Link className="primary-btn" href="/login">Sign in</Link>}<p><Link href="/verify-email">Request another verification link</Link></p></> : <>
      {params.error && <p role="alert">This verification link is invalid or has expired. Request a new link below.</p>}
      <p>Open the verification link in your inbox to confirm this email belongs to you. Links expire in 30 minutes.</p>
      <EmailRequestForm purpose="verification" defaultEmail={session?.user.email || ''} enabled={emailConfigured} />
    </>}
    {!session && <p><Link href="/login">Back to sign in</Link></p>}
  </div></main>;
}
