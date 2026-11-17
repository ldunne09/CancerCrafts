'use server';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/session';
import { db } from '@/lib/db';
import { validPostId } from '@/lib/post-validation';

export type InteractionState = { error?: string; message?: string; saved?: boolean };
function refresh(id: string) {
  revalidatePath('/care'); revalidatePath('/care/community'); revalidatePath(`/care/community/${id}`);
}
export async function addComment(postId: string, _state: InteractionState, form: FormData): Promise<InteractionState> {
  const { user } = await requireSession();
  const raw = form.get('content');
  const content = typeof raw === 'string' ? raw.replace(/\r\n?/g, '\n').trim() : '';
  if (!validPostId(postId) || !content || content.length > 2000) return { error: 'Enter a comment of 1–2,000 characters.' };
  try {
    const result = await db.query('INSERT INTO community_comments(id, post_id, author_id, content) SELECT $1, id, $3, $4 FROM community_posts WHERE id = $2 AND NOT is_hidden RETURNING id', [randomUUID(), postId, user.id, content]);
    if (!result.rowCount) return { error: 'This post is no longer available.' };
  } catch { return { error: 'Your comment could not be saved. Please try again.' }; }
  refresh(postId);
  return { message: 'Comment published.', saved: true };
}
export async function removeComment(postId: string, commentId: string, _state: InteractionState, _form: FormData): Promise<InteractionState> {
  const { user } = await requireSession();
  if (!validPostId(postId) || !validPostId(commentId)) return { error: 'Comment unavailable.' };
  try {
    const result = await db.query('DELETE FROM community_comments WHERE id = $1 AND post_id = $2 AND author_id = $3 RETURNING id', [commentId, postId, user.id]);
    if (!result.rowCount) return { error: 'This comment is unavailable or belongs to another user.' };
  } catch { return { error: 'Your comment could not be deleted.' }; }
  refresh(postId); return { message: 'Comment deleted.' };
}
export async function setSupport(postId: string, _state: InteractionState, form: FormData): Promise<InteractionState> {
  const { user } = await requireSession();
  const supported = form.get('supported');
  if (!validPostId(postId) || !['true', 'false'].includes(String(supported))) return { error: 'Invalid support request.' };
  try {
    if (supported === 'true') {
      const result = await db.query('INSERT INTO community_support(post_id, user_id) SELECT id, $2 FROM community_posts WHERE id = $1 AND NOT is_hidden ON CONFLICT DO NOTHING RETURNING post_id', [postId, user.id]);
      if (!result.rowCount && !(await db.query('SELECT id FROM community_posts WHERE id = $1 AND NOT is_hidden', [postId])).rowCount) return { error: 'Post unavailable.' };
    } else await db.query('DELETE FROM community_support WHERE post_id = $1 AND user_id = $2', [postId, user.id]);
  } catch { return { error: 'Support could not be updated.' }; }
  refresh(postId); return {};
}
export async function reportContent(postId: string, commentId: string | null, _state: InteractionState, form: FormData): Promise<InteractionState> {
  const { user } = await requireSession();
  const reason = form.get('reason');
  const raw = form.get('details');
  const details = typeof raw === 'string' ? raw.trim() : '';
  if (!validPostId(postId) || (commentId !== null && !validPostId(commentId)) || !['spam', 'harassment', 'privacy', 'unsafe', 'other'].includes(String(reason)) || details.length > 1000) return { error: 'Choose a report reason and use at most 1,000 characters.' };
  try {
    const result = commentId
      ? await db.query('INSERT INTO community_reports(id, reporter_id, comment_id, reason, details) SELECT $1, $2, c.id, $4, $5 FROM community_comments c JOIN community_posts p ON p.id=c.post_id WHERE c.id = $3 AND c.post_id = $6 AND NOT c.is_hidden AND NOT p.is_hidden ON CONFLICT DO NOTHING RETURNING id', [randomUUID(), user.id, commentId, reason, details, postId])
      : await db.query('INSERT INTO community_reports(id, reporter_id, post_id, reason, details) SELECT $1, $2, id, $4, $5 FROM community_posts WHERE id = $3 AND NOT is_hidden ON CONFLICT DO NOTHING RETURNING id', [randomUUID(), user.id, postId, reason, details]);
    if (!result.rowCount) return { message: 'Already reported, or this content is no longer available.' };
  } catch { return { error: 'The report could not be saved. Please try again.' }; }
  return { message: 'Report received. Thank you for helping keep the community safe.' };
}
