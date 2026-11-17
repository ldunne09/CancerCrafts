import { loadEnvConfig } from '@next/env';
import { randomUUID } from 'node:crypto';

async function main(){
  loadEnvConfig(process.cwd(),!process.argv.includes('--production'));
  const get=(name:string)=>{const index=process.argv.indexOf(name);return index>=0?process.argv[index+1]:undefined;};
  const email=get('--email')?.trim().toLowerCase();const reason=get('--reason')?.trim();const revoke=process.argv.includes('--revoke');
  if(!email||!reason||reason.length>1000)throw new Error('Provide --email and --reason (1–1,000 characters).');
  const {db}=await import('../lib/db');const client=await db.connect();
  try{
    await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(67311303)');
    const user=(await client.query('SELECT id,name,"emailVerified" FROM "user" WHERE lower(email)=$1 FOR UPDATE',[email])).rows[0];
    if(!user)throw new Error('No registered account exists for this email.');
    if(!revoke&&!user.emailVerified)throw new Error('The account must verify its email before receiving administrator access.');
    const existing=await client.query('SELECT user_id FROM administrator_permissions WHERE user_id=$1',[user.id]);
    if((!revoke&&existing.rowCount)||(revoke&&!existing.rowCount)){console.log(revoke?'Account is not an administrator.':'Account already has administrator access.');await client.query('ROLLBACK');return;}
    if(revoke){
      const count=await client.query('SELECT count(*)::int AS count FROM administrator_permissions a JOIN "user" u ON u.id=a.user_id WHERE u."emailVerified"=true');
      if(user.emailVerified&&count.rows[0].count<2)throw new Error('Cannot revoke the final administrator. Grant another verified account first.');
      await client.query('DELETE FROM administrator_permissions WHERE user_id=$1',[user.id]);
    }else await client.query('INSERT INTO administrator_permissions(user_id,reason) VALUES($1,$2)',[user.id,reason]);
    // NULL actor denotes a controlled database operator rather than a web session.
    await client.query('INSERT INTO admin_audit_log(id,actor_name,action,target_type,target_id,reason) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),'Database operator',revoke?'revoke_admin':'grant_admin','administrator',user.id,reason]);
    await client.query('COMMIT');console.log(revoke?'Administrator access revoked and audited.':'Verified account granted administrator access and audited.');
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();await db.end();}
}
main().catch(error=>{console.error(error instanceof Error?error.message:'Administrator access update failed.');process.exitCode=1;});
