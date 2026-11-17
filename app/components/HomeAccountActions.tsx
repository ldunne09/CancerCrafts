'use client';

import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function HomeAccountActions() {
  const { data: session, isPending } = authClient.useSession();
  if (isPending || session) return null;
  return <div className="actions">
    <Link href="/login" className="primary-btn">Sign in</Link>
    <Link href="/signup" className="secondary-btn">Create account</Link>
  </div>;
}
