import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { ownProfile } from '@/lib/profile';
import ProfileForm from '@/app/components/ProfileForm';

export default async function EditProfilePage() {
  const { user } = await requireSession();
  const profile = await ownProfile(user.id);
  return <main className="page">
    <div className="page-header"><div><div className="breadcrumbs">PROFILE / Edit</div><h1>Edit profile</h1>
      <p className="lead">Update your display name, location, and bio.</p></div><Link href="/profile" className="secondary-btn">Back to profile</Link></div>
    <div className="profile-panel" style={{ maxWidth: 760 }}><ProfileForm profile={{ name: user.name, ...profile }} /></div>
  </main>;
}
