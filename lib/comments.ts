import { db } from './db';
export type Comment = { id: string; author: string; content: string; created_at: Date; owned: boolean };
export async function listComments(postId: string, viewerId?: string, page = 1) {
  const result = await db.query<Comment>(`SELECT c.id, c.content, c.created_at,
    CASE WHEN p.is_anonymous AND c.author_id = p.author_id THEN 'Anonymous post author' ELSE u.name END AS author,
    COALESCE(c.author_id = $2, false) AS owned
    FROM community_comments c JOIN community_posts p ON p.id = c.post_id JOIN "user" u ON u.id = c.author_id
    WHERE c.post_id = $1 AND NOT c.is_hidden AND NOT p.is_hidden ORDER BY c.created_at, c.id LIMIT 51 OFFSET $3`, [postId, viewerId || null, (page - 1) * 50]);
  return { comments: result.rows.slice(0, 50), hasMore: result.rows.length > 50 };
}
