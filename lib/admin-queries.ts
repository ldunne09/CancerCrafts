import { requireAdmin } from './admin';
import { db } from './db';

export { pageNumber } from './pagination';
export async function adminOverview(){
  await requireAdmin();
  return (await db.query<{users:number;posts:number;reports:number;resources:number;listings:number;requests:number}>(`SELECT
    (SELECT count(*)::int FROM "user") AS users,
    (SELECT count(*)::int FROM community_posts) AS posts,
    (SELECT count(*)::int FROM community_reports WHERE status='open') AS reports,
    (SELECT count(*)::int FROM resources WHERE is_active) AS resources,
    (SELECT count(*)::int FROM marketplace_listings) AS listings,
    (SELECT count(*)::int FROM assistance_requests) AS requests`)).rows[0];
}
export type AdminReport={id:string;reason:string;details:string;status:string;resolution_note:string;created_at:Date;post_id:string|null;comment_id:string|null;thread_id:string;content:string;is_hidden:boolean;parent_hidden:boolean};
export async function adminReports(page:number,status:string){
  await requireAdmin();
  return (await db.query<AdminReport>(`SELECT r.id,r.reason,r.details,r.status,r.resolution_note,r.created_at,r.post_id,r.comment_id,COALESCE(r.post_id,c.post_id) AS thread_id,
    COALESCE(c.content,p.content) AS content,CASE WHEN r.comment_id IS NULL THEN p.is_hidden ELSE c.is_hidden END AS is_hidden,p.is_hidden AS parent_hidden
    FROM community_reports r LEFT JOIN community_comments c ON c.id=r.comment_id LEFT JOIN community_posts p ON p.id=COALESCE(r.post_id,c.post_id)
    WHERE ($1='all' OR r.status=$1) ORDER BY r.created_at DESC,r.id DESC LIMIT 26 OFFSET $2`,[status,(page-1)*25])).rows;
}
export type AdminPost={id:string;content:string;author:string;is_hidden:boolean;created_at:Date};
export async function adminPosts(page:number){
  await requireAdmin();
  return (await db.query<AdminPost>(`SELECT p.id,p.content,p.is_hidden,p.created_at,CASE WHEN p.is_anonymous THEN 'Anonymous member' ELSE u.name END AS author FROM community_posts p JOIN "user" u ON u.id=p.author_id ORDER BY p.created_at DESC,p.id DESC LIMIT 26 OFFSET $1`,[(page-1)*25])).rows;
}
export async function adminComments(postId:string){
  await requireAdmin();
  return (await db.query<AdminPost>(`SELECT c.id,c.content,c.is_hidden,c.created_at,CASE WHEN p.is_anonymous AND c.author_id=p.author_id THEN 'Anonymous post author' ELSE u.name END AS author
    FROM community_comments c JOIN community_posts p ON p.id=c.post_id JOIN "user" u ON u.id=c.author_id WHERE p.id=$1 ORDER BY c.created_at,c.id LIMIT 101`,[postId])).rows;
}
export async function adminUsers(page:number){
  await requireAdmin();
  return (await db.query<{id:string;name:string;email:string;role:string;emailVerified:boolean;administrator:boolean}>(`SELECT u.id,u.name,u.email,u.role,u."emailVerified",a.user_id IS NOT NULL AS administrator FROM "user" u LEFT JOIN administrator_permissions a ON a.user_id=u.id ORDER BY u."createdAt" DESC,u.id DESC LIMIT 51 OFFSET $1`,[(page-1)*50])).rows;
}
export async function adminAudit(page:number){
  await requireAdmin();
  return (await db.query<{id:string;actor_name:string;action:string;target_type:string;target_id:string;reason:string;created_at:Date}>('SELECT id,actor_name,action,target_type,target_id,reason,created_at FROM admin_audit_log ORDER BY created_at DESC,id DESC LIMIT 51 OFFSET $1',[(page-1)*50])).rows;
}
