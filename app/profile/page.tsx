import { requireSession } from '@/lib/session';
import Link from 'next/link';
import { hasAdminPermission } from '@/lib/admin';
import { ownProfile } from '@/lib/profile';
export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ updated?: string }> }) {
  const { user } = await requireSession();
  const [administrator, profile, search] = await Promise.all([hasAdminPermission(user.id), ownProfile(user.id), searchParams]);
  return <main className="page">
    <div className="page-header"><div><div className="breadcrumbs">PROFILE</div><h1>Your profile</h1>
      <p className="lead">Welcome to CancerCrafts, {user.name}.</p></div><Link href="/profile/edit" className="primary-btn">Edit profile</Link></div>
    {search.updated === '1' && <p role="status">Profile updated.</p>}
    <div className="profile-panel"><h2>{user.name}</h2><p>{user.role}</p><p>{user.email}</p>
      {profile.location && <p>Location: {profile.location}</p>}
      {profile.bio && <div><h3>Bio</h3><p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{profile.bio}</p></div>}
      {!profile.location && !profile.bio && <p className="meta">Add an optional location or bio using Edit profile.</p>}</div>
    {administrator&&<div className="actions-row"><Link href="/admin" className="primary-btn">Admin dashboard</Link></div>}
  </main>;
}
