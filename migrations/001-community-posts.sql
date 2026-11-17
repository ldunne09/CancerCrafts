CREATE TABLE community_posts (
  id uuid PRIMARY KEY,
  author_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('nutrition', 'transportation', 'wellbeing', 'support')),
  content text NOT NULL CHECK (char_length(trim(content)) BETWEEN 1 AND 5000),
  is_anonymous boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX community_posts_feed ON community_posts (created_at DESC, id DESC);
CREATE INDEX community_posts_author ON community_posts (author_id);
