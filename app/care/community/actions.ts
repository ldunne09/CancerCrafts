'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { db } from '@/lib/db';
import { parsePost, validPostId, type PostState } from '@/lib/post-validation';

function refresh(id: string) {
  revalidatePath('/care');
  revalidatePath('/care/community');
  revalidatePath(`/care/community/${id}`);
}

export async function createPost(_state: PostState, form: FormData): Promise<PostState> {
  const { user } = await requireSession();
  const input = parsePost(form);
  if (!input) return { error: 'Choose a category and enter a post of 1–5,000 characters.' };
  const id = randomUUID();
  try {
    await db.query('INSERT INTO community_posts (id, author_id, category, content, is_anonymous) VALUES ($1, $2, $3, $4, $5)', [id, user.id, input.category, input.content, input.anonymous]);
  } catch {
    return { error: 'Your post could not be saved. Please try again.' };
  }
  refresh(id);
  redirect(`/care/community/${id}`);
}

export async function updatePost(id: string, _state: PostState, form: FormData): Promise<PostState> {
  const { user } = await requireSession();
  const input = parsePost(form);
  if (!validPostId(id) || !input) return { error: 'Choose a category and enter a post of 1–5,000 characters.' };
  try {
    const result = await db.query('UPDATE community_posts SET category = $1, content = $2, is_anonymous = $3, updated_at = now() WHERE id = $4 AND author_id = $5 AND NOT is_hidden RETURNING id', [input.category, input.content, input.anonymous, id, user.id]);
    if (!result.rowCount) return { error: 'This post is unavailable or you do not have permission to edit it.' };
  } catch {
    return { error: 'Your changes could not be saved. Please try again.' };
  }
  refresh(id);
  redirect(`/care/community/${id}`);
}

export async function deletePost(id: string, _state: PostState, _form: FormData): Promise<PostState> {
  const { user } = await requireSession();
  if (!validPostId(id)) return { error: 'This post is unavailable.' };
  try {
    const result = await db.query('DELETE FROM community_posts WHERE id = $1 AND author_id = $2 RETURNING id', [id, user.id]);
    if (!result.rowCount) return { error: 'This post is unavailable or you do not have permission to delete it.' };
  } catch {
    return { error: 'Your post could not be deleted. Please try again.' };
  }
  refresh(id);
  redirect('/care/community');
}
