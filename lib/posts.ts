import { db } from './db';
import { validPostId, type PostInput } from './post-validation';

export type Post = {
  id: string; owned: boolean; author: string; role: string;
  category: PostInput['category']; content: string; is_anonymous: boolean;
  created_at: Date; updated_at: Date;
  support_count: number; comment_count: number; supported: boolean;
};
export type DisplayPost = Omit<Post, 'owned'>;
export function displayPost(post: Post): DisplayPost {
  return {
    id: post.id, category: post.category, content: post.content,
    is_anonymous: post.is_anonymous, created_at: post.created_at, updated_at: post.updated_at,
    author: post.is_anonymous ? 'Anonymous member' : post.author,
    role: post.is_anonymous ? '' : post.role,
    support_count: post.support_count, comment_count: post.comment_count, supported: post.supported,
  };
}
const select = `SELECT p.id, p.category, p.content, p.is_anonymous, p.created_at, p.updated_at,
  CASE WHEN p.is_anonymous THEN 'Anonymous member' ELSE u.name END AS author,
  CASE WHEN p.is_anonymous THEN '' ELSE u.role END AS role,
  COALESCE(p.author_id = $1, false) AS owned,
  (SELECT count(*)::int FROM community_support s WHERE s.post_id = p.id) AS support_count,
  (SELECT count(*)::int FROM community_comments c WHERE c.post_id = p.id AND NOT c.is_hidden) AS comment_count,
  EXISTS(SELECT 1 FROM community_support s WHERE s.post_id = p.id AND s.user_id = $1) AS supported
  FROM community_posts p JOIN "user" u ON u.id = p.author_id`;

export async function listPosts(limit = 20, page = 1, viewerId?: string) {
  const result = await db.query<Post>(`${select} WHERE NOT p.is_hidden ORDER BY p.created_at DESC, p.id DESC LIMIT $2 OFFSET $3`, [viewerId || null, limit + 1, (page - 1) * limit]);
  return { posts: result.rows.slice(0, limit), hasMore: result.rows.length > limit };
}
export async function getPost(id: string, viewerId?: string) {
  if (!validPostId(id)) return null;
  const result = await db.query<Post>(`${select} WHERE p.id = $2 AND NOT p.is_hidden`, [viewerId || null, id]);
  return result.rows[0] || null;
}
