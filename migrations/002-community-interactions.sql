CREATE TABLE community_comments (
  id uuid PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(trim(content)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX community_comments_thread ON community_comments(post_id, created_at, id);
CREATE TABLE community_support (
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(post_id, user_id)
);
CREATE TABLE community_reports (
  id uuid PRIMARY KEY,
  reporter_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES community_comments(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('spam', 'harassment', 'privacy', 'unsafe', 'other')),
  details text NOT NULL DEFAULT '' CHECK (char_length(details) <= 1000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(post_id, comment_id) = 1)
);
CREATE UNIQUE INDEX community_reports_post ON community_reports(reporter_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX community_reports_comment ON community_reports(reporter_id, comment_id) WHERE comment_id IS NOT NULL;
