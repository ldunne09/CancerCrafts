'use server';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { validPostId } from '@/lib/post-validation';
import { cents, parseCatalog, type CatalogKind, type CatalogState } from '@/lib/catalog-validation';
import { catalogPath } from '@/lib/catalog';

function refresh(kind: CatalogKind, id: string) {
  revalidatePath(kind === 'listing' ? '/earn' : '/help'); revalidatePath(catalogPath(kind));
  revalidatePath(`${catalogPath(kind)}/${id}`); revalidatePath('/earn/my-listings');
}
function validKind(kind: unknown): kind is CatalogKind { return kind === 'listing' || kind === 'request'; }
async function image(form: FormData) {
  const file = form.get('image');
  if (!(file instanceof File) || !file.size) return null;
  if (file.size > 2097152) throw new Error('Use a PNG, JPEG, or WebP image up to 2 MB.');
  const data = Buffer.from(await file.arrayBuffer());
  const type = data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'image/png'
    : data[0] === 255 && data[1] === 216 && data[2] === 255 ? 'image/jpeg'
    : data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP' ? 'image/webp' : null;
  if (!type) throw new Error('Use a valid PNG, JPEG, or WebP image.');
  return { data, type };
}
export async function saveCatalog(kind: CatalogKind, id: string | null, _state: CatalogState, form: FormData): Promise<CatalogState> {
  const { user } = await requireSession();
  if (!validKind(kind) || (id !== null && !validPostId(id))) return { error: 'Invalid item.' };
  const input = parseCatalog(form, kind);
  if (!input) return { error: 'Enter a title (1–120 characters), description (1–5,000), valid category, and amount between $0.01 and $1,000,000.' };
  let upload = null;
  try { if (kind === 'listing') upload = await image(form); } catch (error) { return { error: error instanceof Error ? error.message : 'Invalid image.' }; }
  const itemId = id || randomUUID();
  const table = kind === 'listing' ? 'marketplace_listings' : 'assistance_requests';
  const owner = kind === 'listing' ? 'seller_id' : 'user_id';
  const amount = kind === 'listing' ? 'price_cents' : 'goal_cents';
  try {
    if (id) {
      const result = kind === 'listing'
        ? await db.query(`UPDATE marketplace_listings SET title=$1, description=$2, category=$3, price_cents=$4, updated_at=now(), image_data=CASE WHEN $7::boolean THEN $8::bytea ELSE image_data END, image_type=CASE WHEN $7::boolean THEN $9::text ELSE image_type END WHERE id=$5 AND seller_id=$6 RETURNING id`, [input.title,input.description,input.category,input.amount,id,user.id,!!upload || form.get('removeImage') === 'on',upload?.data || null,upload?.type || null])
        : await db.query(`UPDATE assistance_requests SET title=$1, description=$2, category=$3, goal_cents=$4, updated_at=now() WHERE id=$5 AND user_id=$6 RETURNING id`, [input.title,input.description,input.category,input.amount,id,user.id]);
      if (!result.rowCount) return { error: 'This item is unavailable or belongs to another user.' };
    } else if (kind === 'listing') await db.query('INSERT INTO marketplace_listings(id,seller_id,title,description,category,price_cents,image_data,image_type) VALUES($1,$2,$3,$4,$5,$6,$7,$8)', [itemId,user.id,input.title,input.description,input.category,input.amount,upload?.data || null,upload?.type || null]);
    else await db.query(`INSERT INTO ${table}(id,${owner},title,description,category,${amount}) VALUES($1,$2,$3,$4,$5,$6)`, [itemId,user.id,input.title,input.description,input.category,input.amount]);
  } catch { return { error: 'This item could not be saved. Please try again.' }; }
  refresh(kind,itemId); redirect(`${catalogPath(kind)}/${itemId}`);
}
export async function deleteCatalog(kind: CatalogKind, id: string, _state: CatalogState, _form: FormData): Promise<CatalogState> {
  const { user } = await requireSession();
  if (!validKind(kind) || !validPostId(id)) return { error: 'Invalid item.' };
  try {
    const result = await db.query(`DELETE FROM ${kind === 'listing' ? 'marketplace_listings' : 'assistance_requests'} WHERE id=$1 AND ${kind === 'listing' ? 'seller_id' : 'user_id'}=$2 RETURNING id`, [id,user.id]);
    if (!result.rowCount) return { error: 'This item is unavailable or belongs to another user.' };
  } catch { return { error: 'This item could not be deleted.' }; }
  refresh(kind,id); redirect(catalogPath(kind));
}
export async function donate(id: string, _state: CatalogState, form: FormData): Promise<CatalogState> {
  const { user } = await requireSession();
  const amount = cents(form.get('amount'));
  if (!validPostId(id) || amount === null || form.get('confirm') !== 'on') return { error: 'Enter a valid amount and confirm this is a simulation.' };
  try {
    const result = await db.query('INSERT INTO assistance_donations(id,request_id,donor_id,amount_cents) SELECT $1,id,$3,$4 FROM assistance_requests WHERE id=$2 RETURNING id', [randomUUID(),id,user.id,amount]);
    if (!result.rowCount) return { error: 'Request unavailable.' };
  } catch { return { error: 'The simulated donation could not be saved.' }; }
  refresh('request',id); return { message: 'Simulated donation saved. No money was charged.' };
}
export async function purchase(id: string, _state: CatalogState, form: FormData): Promise<CatalogState> {
  const { user } = await requireSession();
  if (!validPostId(id) || form.get('confirm') !== 'on') return { error: 'Confirm this is a simulated purchase.' };
  const order = randomUUID();
  try {
    const result = await db.query('INSERT INTO marketplace_orders(id,listing_id,buyer_id,seller_name,title,price_cents) SELECT $1,p.id,$3,u.name,p.title,p.price_cents FROM marketplace_listings p JOIN "user" u ON u.id=p.seller_id WHERE p.id=$2 AND p.seller_id<>$3 RETURNING id', [order,id,user.id]);
    if (!result.rowCount) return { error: 'The listing is unavailable or belongs to you.' };
  } catch { return { error: 'The simulated order could not be saved.' }; }
  redirect(`/earn/orders/${order}`);
}
export async function addRequestUpdate(id: string, _state: CatalogState, form: FormData): Promise<CatalogState> {
  const { user } = await requireSession();
  const raw = form.get('content'); const content = typeof raw === 'string' ? raw.trim() : '';
  if (!validPostId(id) || !content || content.length>2000) return { error: 'Enter an update of 1–2,000 characters.' };
  try {
    const result=await db.query('INSERT INTO assistance_updates(id,request_id,content) SELECT $1,id,$4 FROM assistance_requests WHERE id=$2 AND user_id=$3 RETURNING id', [randomUUID(),id,user.id,content]);
    if (!result.rowCount) return { error: 'This request is unavailable or belongs to another user.' };
  } catch { return { error: 'The update could not be saved.' }; }
  refresh('request',id); return { message: 'Update published.' };
}
