import Link from 'next/link';
import { emailConfigured } from '@/lib/email';
import { EmailRequestForm } from '@/app/components/EmailForms';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Forgot password | CancerCrafts', robots: { index: false, follow: false } };
export default function Page() {
  return <main className="page"><div className="profile-panel" style={{ maxWidth: 680 }}><h1>Forgot your password?</h1><p>Enter your account email to request a secure reset link.</p>
    <EmailRequestForm purpose="reset" enabled={emailConfigured} /><p><Link href="/login">Back to sign in</Link></p>
  </div></main>;
}
