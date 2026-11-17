import { db } from '@/lib/db';
import { validPostId } from '@/lib/post-validation';
export async function GET(_request: Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if(!validPostId(id))return new Response(null,{status:404});
  const result=await db.query<{image_data:Buffer;image_type:string}>('SELECT image_data,image_type FROM marketplace_listings WHERE id=$1 AND image_data IS NOT NULL',[id]);
  const image=result.rows[0]; if(!image)return new Response(null,{status:404});
  return new Response(new Uint8Array(image.image_data),{headers:{'Content-Type':image.image_type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
}
