import { cache } from 'react';
import { notFound } from 'next/navigation';
import { requireSession } from './session';
import { db } from './db';
import type { PoolClient } from 'pg';
import { randomUUID } from 'node:crypto';

export async function hasAdminPermission(userId: string) {
  const result = await db.query('SELECT a.user_id FROM administrator_permissions a JOIN "user" u ON u.id=a.user_id WHERE a.user_id=$1 AND u."emailVerified"=true',[userId]);
  return result.rowCount === 1;
}
export const requireAdmin = cache(async () => {
  const session = await requireSession();
  if (!session.user.emailVerified || !await hasAdminPermission(session.user.id)) notFound();
  return session;
});

export class AdminAccessError extends Error {}
export async function adminTransaction<T>(userId: string, work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    // Hold permission until this action commits; revocation cannot race past it.
    const permission = await client.query('SELECT a.user_id FROM administrator_permissions a JOIN "user" u ON u.id=a.user_id WHERE a.user_id=$1 AND u."emailVerified"=true FOR SHARE OF a,u',[userId]);
    if (!permission.rowCount) throw new AdminAccessError('Administrator permission is required.');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
export async function audit(client: PoolClient, actor: {id: string;name: string}, action: string, type: string, target: string, reason: string) {
  await client.query('INSERT INTO admin_audit_log(id,actor_id,actor_name,action,target_type,target_id,reason) VALUES($1,$2,$3,$4,$5,$6,$7)',[randomUUID(),actor.id,actor.name,action,type,target,reason]);
}
