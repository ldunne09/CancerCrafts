import { emailConfigured } from '@/lib/email';
import { ResetPasswordForm } from '@/app/components/EmailForms';
export const metadata = { title: 'Reset password | CancerCrafts', robots: { index: false, follow: false }, referrer: 'no-referrer' as const };
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  return <main className="page"><div className="profile-panel" style={{ maxWidth: 680 }}><h1>Reset your password</h1><ResetPasswordForm token={typeof token === 'string' ? token : undefined} invalid={!!error} enabled={emailConfigured} /></div></main>;
}
