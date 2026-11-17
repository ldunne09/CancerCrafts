'use server';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { adminTransaction, audit, AdminAccessError } from '@/lib/admin';
import { validPostId } from '@/lib/post-validation';
import { moderationReason, parseResource, type AdminState } from '@/lib/resource-validation';

function refreshModeration() {
  revalidatePath('/admin'); revalidatePath('/admin/reports'); revalidatePath('/admin/posts'); revalidatePath('/admin/audit');
  revalidatePath('/care'); revalidatePath('/care/community','layout');
}
function actionError(error:unknown):AdminState {return {error:error instanceof AdminAccessError?'Administrator permission is required.':'The action could not be saved. Please try again.'};}
export async function moderateContent(kind:'post'|'comment', id:string, _state:AdminState, form:FormData):Promise<AdminState> {
  const {user}=await requireSession(); const reason=moderationReason(form); const hidden=form.get('hidden');
  if(!['post','comment'].includes(kind)||!validPostId(id)||!reason||!['true','false'].includes(String(hidden)))return {error:'Choose an action and enter a reason of 1–1,000 characters.'};
  try{
    await adminTransaction(user.id,async client=>{
      const table=kind==='post'?'community_posts':'community_comments';
      const result=await client.query(`UPDATE ${table} SET is_hidden=$1 WHERE id=$2 AND is_hidden<>$1 RETURNING id`,[hidden==='true',id]);
      if(!result.rowCount)throw new Error('Content unavailable or unchanged.');
      await audit(client,user,`${hidden==='true'?'hide':'restore'}_${kind}`,kind,id,reason);
    });
  }catch(error){return actionError(error);}
  refreshModeration();return {message:hidden==='true'?'Content hidden from the community.':'Content restored.'};
}
export async function resolveReport(id:string,_state:AdminState,form:FormData):Promise<AdminState>{
  const {user}=await requireSession();const reason=moderationReason(form);const status=form.get('status');
  if(!validPostId(id)||!reason||!['open','resolved'].includes(String(status)))return {error:'Enter a resolution note of 1–1,000 characters.'};
  try{
    await adminTransaction(user.id,async client=>{
      const result=await client.query("UPDATE community_reports SET status=$1,resolved_by=CASE WHEN $1='resolved' THEN $2::text ELSE NULL END,resolved_at=CASE WHEN $1='resolved' THEN now() ELSE NULL END,resolution_note=$3 WHERE id=$4 AND status<>$1 RETURNING id",[status,user.id,reason,id]);
      if(!result.rowCount)throw new Error('Report unavailable or unchanged.');
      await audit(client,user,status==='resolved'?'resolve_report':'reopen_report','report',id,reason);
    });
  }catch(error){return actionError(error);}
  refreshModeration();return {message:status==='resolved'?'Report resolved.':'Report reopened.'};
}
export async function saveResource(id:string|null,_state:AdminState,form:FormData):Promise<AdminState>{
  const {user}=await requireSession();const reason=moderationReason(form);const item=parseResource(form);
  if((id!==null&&!validPostId(id))||!reason||!item)return {error:'Check the resource fields, use an HTTPS website URL, and enter an administrative reason.'};
  const resourceId=id||randomUUID();
  try{
    await adminTransaction(user.id,async client=>{
      const values=[item.name,item.organization,item.description,item.category,item.location,item.website_url,item.phone,item.is_active,resourceId];
      if(id){
        const result=await client.query('UPDATE resources SET name=$1,organization=$2,description=$3,category=$4,location=$5,website_url=$6,phone=$7,is_active=$8,updated_at=now() WHERE id=$9 RETURNING id',values);
        if(!result.rowCount)throw new Error('Resource unavailable.');
      }else await client.query('INSERT INTO resources(name,organization,description,category,location,website_url,phone,is_active,id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',values);
      await audit(client,user,!id?'create_resource':item.is_active?'update_resource':'disable_resource','resource',resourceId,reason);
    });
  }catch(error){return actionError(error);}
  revalidatePath('/admin');revalidatePath('/admin/resources');revalidatePath('/admin/audit');revalidatePath('/care/resources','layout');revalidatePath('/care');
  redirect('/admin/resources');
}
