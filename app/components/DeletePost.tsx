'use client';

import { useActionState, useState } from 'react';
import { deletePost } from '@/app/care/community/actions';

export default function DeletePost({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false);
  const [state, action, pending] = useActionState(deletePost.bind(null, id), {});
  if (!confirm) return <button type="button" className="secondary-btn" onClick={() => setConfirm(true)}>Delete post</button>;
  return <form action={action} aria-busy={pending}>
    <p>Delete this post permanently?</p>
    {state.error && <p role="alert">{state.error}</p>}
    <div className="actions-row"><button type="submit" className="primary-btn" disabled={pending}>{pending ? 'Deleting…' : 'Confirm delete'}</button>
      <button type="button" className="secondary-btn" disabled={pending} onClick={() => setConfirm(false)}>Keep post</button></div>
  </form>;
}
