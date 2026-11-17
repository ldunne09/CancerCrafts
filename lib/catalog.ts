import { db } from './db';
import { validPostId } from './post-validation';
import type { CatalogKind } from './catalog-validation';
export type CatalogItem = {
  id: string; title: string; description: string; category: string; amount: number;
  owner_name: string; owned: boolean; has_image: boolean; raised: number; updated_at: Date;
};
export const catalogPath = (kind: CatalogKind) => kind === 'listing' ? '/earn/marketplace' : '/help/requests';
function query(kind: CatalogKind) {
  return kind === 'listing'
    ? `SELECT p.id, p.title, p.description, p.category, p.price_cents AS amount, u.name AS owner_name, COALESCE(p.seller_id = $1, false) AS owned, p.image_data IS NOT NULL AS has_image, 0 AS raised, p.updated_at FROM marketplace_listings p JOIN "user" u ON u.id = p.seller_id`
    : `SELECT p.id, p.title, p.description, p.category, p.goal_cents AS amount, u.name AS owner_name, COALESCE(p.user_id = $1, false) AS owned, false AS has_image, COALESCE((SELECT sum(d.amount_cents) FROM assistance_donations d WHERE d.request_id = p.id), 0)::float8 AS raised, p.updated_at FROM assistance_requests p JOIN "user" u ON u.id = p.user_id`;
}
export async function catalogFeed(kind: CatalogKind, viewerId?: string, page = 1, mine = false) {
  const result = await db.query<CatalogItem>(`${query(kind)} ${mine ? `WHERE p.${kind === 'listing' ? 'seller_id' : 'user_id'} = $1` : ''} ORDER BY p.created_at DESC, p.id DESC LIMIT 21 OFFSET $2`, [viewerId || null, (page - 1) * 20]);
  return { items: result.rows.slice(0, 20), hasMore: result.rows.length > 20 };
}
export async function catalogItem(kind: CatalogKind, id: string, viewerId?: string) {
  if (!validPostId(id)) return null;
  return (await db.query<CatalogItem>(`${query(kind)} WHERE p.id = $2`, [viewerId || null, id])).rows[0] || null;
}
