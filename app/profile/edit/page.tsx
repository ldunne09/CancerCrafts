import Link from 'next/link';

export default function EditProfilePage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">PROFILE / Edit</div>
          <h1>Edit profile</h1>
          <p className="lead">Update your details, location, and story.</p>
        </div>
        <Link href="/profile" className="secondary-btn">Back to profile</Link>
      </div>

      <div className="profile-panel" style={{ maxWidth: 760 }}>
        <form className="form-grid">
          <div className="field">
            <label htmlFor="name">Display name</label>
            <input id="name" type="text" defaultValue="Jordan Smith" />
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" type="text" defaultValue="Seattle, WA" />
          </div>
          <div className="field">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" defaultValue="I’m navigating treatment and looking for practical support, shared advice, and small ways to connect with others." />
          </div>
          <button type="button" className="primary-btn">Save changes</button>
        </form>
      </div>
    </main>
  );
}
