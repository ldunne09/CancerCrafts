CREATE TABLE user_profiles (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  location text NOT NULL DEFAULT '' CHECK(char_length(location) <= 160),
  bio text NOT NULL DEFAULT '' CHECK(char_length(bio) <= 1000),
  updated_at timestamptz NOT NULL DEFAULT now()
);
