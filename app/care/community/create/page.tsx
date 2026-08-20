import Link from 'next/link';

export default function CreatePostPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">CARE / Community / Create</div>
          <h1>Create a post</h1>
          <p className="lead">Share something helpful, practical, or encouraging with the community.</p>
        </div>
        <Link href="/care/community" className="secondary-btn">Cancel</Link>
      </div>

      <div className="profile-panel" style={{ maxWidth: 700 }}>
        <form className="form-grid">
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" defaultValue="nutrition">
              <option value="nutrition">Nutrition</option>
              <option value="transportation">Transportation</option>
              <option value="wellbeing">Wellbeing</option>
              <option value="support">Support</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="content">Post</label>
            <textarea id="content" placeholder="Share what you need, what you’ve learned, or how someone can help." defaultValue="I’m looking for ideas to make appointments feel a little easier. What support has helped others stay steady during treatment weeks?" />
          </div>
          <div className="checkbox-row">
            <input type="checkbox" id="anonymous" />
            <label htmlFor="anonymous">Post anonymously</label>
          </div>
          <button type="button" className="primary-btn">Publish post</button>
        </form>
      </div>
    </main>
  );
}
