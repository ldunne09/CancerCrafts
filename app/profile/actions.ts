'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/session';
import { db } from '@/lib/db';
import { parseProfile, type ProfileState } from '@/lib/profile-validation';
import type { PoolClient } from 'pg';

export async function saveProfile(_state: ProfileState, form: FormData): Promise<ProfileState> {
  const { user } = await requireSession();
  const values = parseProfile(form);
  if (!values) return { error: 'Use a display name of 1–80 characters, a location up to 160 characters, and a bio up to 1,000 characters.' };
  let client: PoolClient | undefined;
  try {
    client = await db.connect();
    await client.query('BEGIN');
    const result = await client.query('UPDATE "user" SET name=$1, "updatedAt"=now() WHERE id=$2 RETURNING id', [values.name, user.id]);
    if (!result.rowCount) throw new Error('Account unavailable.');
    await client.query('INSERT INTO user_profiles(user_id, location, bio) VALUES($1,$2,$3) ON CONFLICT(user_id) DO UPDATE SET location=EXCLUDED.location, bio=EXCLUDED.bio, updated_at=now()', [user.id, values.location, values.bio]);
    await client.query('COMMIT');
  } catch {
    if (client) await client.query('ROLLBACK').catch(() => {});
    return { error: 'Your profile could not be saved. Your changes are still in the form; please try again.' };
  } finally { client?.release(); }
  revalidatePath('/profile', 'layout');
  revalidatePath('/care');
  revalidatePath('/care/community', 'layout');
  revalidatePath('/earn', 'layout');
  revalidatePath('/help', 'layout');
  revalidatePath('/admin', 'layout');
  redirect('/profile?updated=1');
}
