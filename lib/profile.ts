import { db } from './db';

export async function ownProfile(userId: string) {
  const result = await db.query<{ location: string; bio: string }>('SELECT location, bio FROM user_profiles WHERE user_id=$1', [userId]);
  return result.rows[0] || { location: '', bio: '' };
}
