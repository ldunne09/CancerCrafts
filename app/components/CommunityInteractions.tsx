'use client';
import { useActionState, useEffect, useId, useState } from 'react';
import { addComment, removeComment, reportContent, setSupport } from '@/app/care/community/interactions';

export function SupportButton({ id, supported, count }: { id: string; supported: boolean; count: number }) {
  const [state, action, pending] = useActionState(setSupport.bind(null, id), {});
  return <form action={action}><input type="hidden" name="supported" value={String(!supported)} />
    <button type="submit" className="chip" aria-pressed={supported} disabled={pending}>{supported ? 'Supported' : 'Send support'} · {count}</button>
    {state.error && <p role="alert">{state.error}</p>}</form>;
}
export function ReportForm({ postId, commentId = null }: { postId: string; commentId?: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(reportContent.bind(null, postId, commentId), {});
  const id = useId();
  if (!open) return <button type="button" className="chip" onClick={() => setOpen(true)}>Report {commentId ? 'comment' : 'post'}</button>;
  return <form action={action} className="form-grid" style={{ marginTop: 12 }}>
    <div className="field"><label htmlFor={`${id}-reason`}>Report reason</label><select name="reason" id={`${id}-reason`} required>
      <option value="spam">Spam</option><option value="harassment">Harassment</option><option value="privacy">Privacy concern</option><option value="unsafe">Unsafe content</option><option value="other">Other</option>
    </select></div><div className="field"><label htmlFor={`${id}-details`}>Additional details (optional)</label><textarea name="details" id={`${id}-details`} maxLength={1000} /></div>
    {state.error && <p role="alert">{state.error}</p>}{state.message && <p role="status">{state.message}</p>}
    <div className="actions-row"><button type="submit" className="secondary-btn" disabled={pending || !!state.message}>{pending ? 'Submitting…' : 'Submit report'}</button>
      <button type="button" className="chip" onClick={() => setOpen(false)}>Close report</button></div>
  </form>;
}
export function CommentForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(addComment.bind(null, postId), {});
  const [content, setContent] = useState('');
  useEffect(() => { if (state.saved) setContent(''); }, [state]);
  return <form action={action} className="form-grid" style={{ marginTop: 20 }}>
    <div className="field"><label htmlFor="new-comment">Add a comment</label><textarea id="new-comment" name="content" value={content} onChange={event => setContent(event.target.value)} required maxLength={2000} /></div>
    <p className="meta">Comments use your display name. Replies to your own anonymous post stay anonymous.</p>
    {state.error && <p role="alert">{state.error}</p>}{state.message && <p role="status">{state.message}</p>}
    <button type="submit" className="primary-btn" disabled={pending}>{pending ? 'Publishing…' : 'Post comment'}</button>
  </form>;
}
export function DeleteComment({ postId, id }: { postId: string; id: string }) {
  const [state, action, pending] = useActionState(removeComment.bind(null, postId, id), {});
  const [confirm, setConfirm] = useState(false);
  if (!confirm) return <button type="button" className="chip" onClick={() => setConfirm(true)}>Delete comment</button>;
  return <form action={action}><p>Permanently delete this comment?</p><button type="submit" className="chip" disabled={pending}>Confirm delete comment</button>
    <button type="button" className="chip" onClick={() => setConfirm(false)}>Keep comment</button>{state.error && <p role="alert">{state.error}</p>}</form>;
}
