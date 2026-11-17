import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import { emailVerificationRequired } from './email';

export const requireSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');
  if (emailVerificationRequired && !session.user.emailVerified) redirect('/verify-email');
  return session;
});
