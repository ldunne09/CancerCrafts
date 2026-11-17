'use client';
import Link from 'next/link';
export default function ProfileError({ reset }: { reset: () => void }) {
  return <main className="page"><div className="profile-panel"><h1>Your profile is temporarily unavailable</h1>
    <p>We could not load your profile. Please try again.</p>
    <div className="actions-row"><button type="button" className="primary-btn" onClick={reset}>Try again</button><Link href="/care" className="secondary-btn">Back to CARE</Link></div>
  </div></main>;
}
