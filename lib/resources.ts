import { db } from './db';
import { requireAdmin } from './admin';
import { validPostId } from './post-validation';
export type Resource={id:string;name:string;organization:string;description:string;category:string;location:string;website_url:string;phone:string;is_active:boolean};
export async function resourceList({page=1,q='',category='',location=''}:{page?:number;q?:string;category?:string;location?:string},administrative=false){
  if(administrative)await requireAdmin();
  return (await db.query<Resource>(`SELECT id,name,organization,description,category,location,website_url,phone,is_active FROM resources
    WHERE ($1::boolean OR is_active) AND ($2='' OR name ILIKE '%'||$2||'%' OR organization ILIKE '%'||$2||'%' OR description ILIKE '%'||$2||'%')
    AND ($3='' OR category=$3) AND ($4='' OR location ILIKE '%'||$4||'%') ORDER BY created_at DESC,id DESC LIMIT 25 OFFSET $5`,[administrative,q.slice(0,160),category.slice(0,40),location.slice(0,160),(page-1)*24])).rows;
}
export async function getResource(id:string,administrative=false){
  if(administrative)await requireAdmin();
  if(!validPostId(id))return null;
  return (await db.query<Resource>('SELECT id,name,organization,description,category,location,website_url,phone,is_active FROM resources WHERE id=$1 AND ($2::boolean OR is_active)',[id,administrative])).rows[0]||null;
}
