'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { createPost, updatePost } from '@/app/care/community/actions';
import { categories, type PostInput } from '@/lib/post-validation';

type EditablePost = { id: string; category: PostInput['category']; content: string; is_anonymous: boolean };
export default function PostForm({ post }: { post?: EditablePost }) {
  const [state, action, pending] = useActionState(post ? updatePost.bind(null, post.id) : createPost, {});
  const [content, setContent] = useState(post?.content || '');
  const [category, setCategory] = useState(post?.category || 'support');
  const [anonymous, setAnonymous] = useState(post?.is_anonymous || false);
  return <form action={action} className="form-grid" aria-busy={pending}>
    <div className="field"><label htmlFor="category">Category</label>
      <select id="category" name="category" value={category} onChange={event => setCategory(event.target.value as PostInput['category'])} required>
        {Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></div>
    <div className="field"><label htmlFor="content">Post</label>
      <textarea id="content" name="content" placeholder="Share what you need, what you’ve learned, or how someone can help." value={content} onChange={event => setContent(event.target.value)} required maxLength={5000} aria-describedby="post-hint" />
      <span className="meta" id="post-hint">Up to 5,000 characters. Share only details you are comfortable making public.</span></div>
    <div className="checkbox-row"><input id="anonymous" name="anonymous" type="checkbox" checked={anonymous} onChange={event => setAnonymous(event.target.checked)} />
      <label htmlFor="anonymous">Post anonymously</label></div>
    <p className="meta">Anonymous posts hide your name from the community. You can still manage your own posts.</p>
    {state.error && <p role="alert">{state.error}</p>}
    <div className="actions-row">
      <button type="submit" className="primary-btn" disabled={pending}>{pending ? 'Saving…' : post ? 'Save changes' : 'Publish post'}</button>
      <Link href={post ? `/care/community/${post.id}` : '/care/community'} className="secondary-btn">Cancel</Link>
    </div>
  </form>;
}
