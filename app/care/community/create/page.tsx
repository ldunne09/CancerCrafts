import { requireSession } from '@/lib/session';
import PostForm from '@/app/components/PostForm';

export default async function CreatePostPage() {
  await requireSession();
  return <main className="page"><div className="page-header"><div>
    <div className="breadcrumbs">CARE / Community / Create</div><h1>Create a post</h1>
    <p className="lead">Share something helpful, practical, or encouraging with the community.</p>
  </div></div><div className="profile-panel" style={{ maxWidth: 760 }}><PostForm /></div></main>;
}
