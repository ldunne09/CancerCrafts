import AuthForm from '../components/AuthForm';
import { emailVerificationRequired } from '@/lib/email';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export default async function SignupPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect(emailVerificationRequired && !session.user.emailVerified ? '/verify-email' : '/care');
  return <AuthForm signup verificationRequired={emailVerificationRequired} />;
}
