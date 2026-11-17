CREATE TABLE marketplace_listings (
  id uuid PRIMARY KEY,
  seller_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title text NOT NULL CHECK(char_length(trim(title)) BETWEEN 1 AND 120),
  description text NOT NULL CHECK(char_length(trim(description)) BETWEEN 1 AND 5000),
  category text NOT NULL CHECK(category IN ('care-kits', 'wellbeing', 'support-services')),
  price_cents integer NOT NULL CHECK(price_cents BETWEEN 1 AND 100000000),
  image_data bytea CHECK(octet_length(image_data) <= 2097152),
  image_type text CHECK(image_type IN ('image/jpeg', 'image/png', 'image/webp')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK((image_data IS NULL) = (image_type IS NULL))
);
CREATE INDEX marketplace_listings_feed ON marketplace_listings(created_at DESC, id DESC);
CREATE INDEX marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE TABLE assistance_requests (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title text NOT NULL CHECK(char_length(trim(title)) BETWEEN 1 AND 120),
  description text NOT NULL CHECK(char_length(trim(description)) BETWEEN 1 AND 5000),
  category text NOT NULL CHECK(category IN ('transportation', 'meals', 'household', 'financial')),
  goal_cents integer NOT NULL CHECK(goal_cents BETWEEN 1 AND 100000000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX assistance_requests_feed ON assistance_requests(created_at DESC, id DESC);
CREATE INDEX assistance_requests_owner ON assistance_requests(user_id);
CREATE TABLE assistance_updates (
  id uuid PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES assistance_requests(id) ON DELETE CASCADE,
  content text NOT NULL CHECK(char_length(trim(content)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX assistance_updates_request ON assistance_updates(request_id, created_at);
CREATE TABLE assistance_donations (
  id uuid PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES assistance_requests(id) ON DELETE CASCADE,
  donor_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL CHECK(amount_cents BETWEEN 1 AND 100000000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX assistance_donations_request ON assistance_donations(request_id);
CREATE TABLE marketplace_orders (
  id uuid PRIMARY KEY,
  listing_id uuid REFERENCES marketplace_listings(id) ON DELETE SET NULL,
  buyer_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  seller_name text NOT NULL,
  title text NOT NULL,
  price_cents integer NOT NULL CHECK(price_cents > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
