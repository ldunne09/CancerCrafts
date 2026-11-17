'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { saveProfile } from '@/app/profile/actions';
import type { ProfileValues } from '@/lib/profile-validation';

export default function ProfileForm({ profile }: { profile: ProfileValues }) {
  const [state, action, pending] = useActionState(saveProfile, {});
  const [values, setValues] = useState(profile);
  const update = (key: keyof ProfileValues, value: string) => setValues(previous => ({ ...previous, [key]: value }));
  return <form action={action} className="form-grid" aria-busy={pending}>
    <div className="field"><label htmlFor="profile-name">Display name</label>
      <input id="profile-name" name="name" value={values.name} onChange={event => update('name', event.target.value)} required maxLength={80} autoComplete="nickname" aria-describedby="profile-name-hint" />
      <span id="profile-name-hint" className="meta">Your display name appears on your non-anonymous community content and listings.</span>
    </div>
    <div className="field"><label htmlFor="profile-location">Location (optional)</label>
      <input id="profile-location" name="location" value={values.location} onChange={event => update('location', event.target.value)} maxLength={160} autoComplete="address-level2" />
    </div>
    <div className="field"><label htmlFor="profile-bio">Bio (optional)</label>
      <textarea id="profile-bio" name="bio" value={values.bio} onChange={event => update('bio', event.target.value)} maxLength={1000} />
    </div>
    <p className="meta">Location and bio are shown only on your own account profile for now. You do not need to share medical details.</p>
    {state.error && <p role="alert">{state.error}</p>}
    <div className="actions-row"><button type="submit" className="primary-btn" disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</button>
      <Link href="/profile" className="secondary-btn">Cancel</Link></div>
  </form>;
}
