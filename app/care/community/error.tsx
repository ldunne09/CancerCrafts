'use client';
export default function CommunityError({ reset }: { reset: () => void }) {
  return <main className="page"><div className="profile-panel"><h1>Community is temporarily unavailable</h1>
    <p>We could not load this page. Your saved posts are still stored.</p>
    <button type="button" className="primary-btn" onClick={reset}>Try again</button></div></main>;
}
