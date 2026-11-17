CREATE TABLE administrator_permissions (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  granted_by text REFERENCES "user"(id) ON DELETE SET NULL,
  reason text NOT NULL CHECK(char_length(trim(reason)) BETWEEN 1 AND 1000),
  granted_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE admin_audit_log (
  id uuid PRIMARY KEY,
  actor_id text REFERENCES "user"(id) ON DELETE SET NULL,
  actor_name text NOT NULL,
  action text NOT NULL CHECK(action IN ('grant_admin','revoke_admin','hide_post','restore_post','hide_comment','restore_comment','resolve_report','reopen_report','create_resource','update_resource','disable_resource')),
  target_type text NOT NULL CHECK(target_type IN ('administrator','post','comment','report','resource')),
  target_id text NOT NULL,
  reason text NOT NULL CHECK(char_length(trim(reason)) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX admin_audit_log_recent ON admin_audit_log(created_at DESC,id DESC);
ALTER TABLE community_posts ADD COLUMN is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE community_comments ADD COLUMN is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE community_reports ADD COLUMN resolved_by text REFERENCES "user"(id) ON DELETE SET NULL;
ALTER TABLE community_reports ADD COLUMN resolved_at timestamptz;
ALTER TABLE community_reports ADD COLUMN resolution_note text NOT NULL DEFAULT '' CHECK(char_length(resolution_note)<=1000);
CREATE INDEX community_reports_queue ON community_reports(status,created_at DESC,id DESC);
CREATE TABLE resources (
  id uuid PRIMARY KEY,
  name text NOT NULL CHECK(char_length(trim(name)) BETWEEN 1 AND 160),
  organization text NOT NULL DEFAULT '' CHECK(char_length(organization)<=160),
  description text NOT NULL CHECK(char_length(trim(description)) BETWEEN 1 AND 5000),
  category text NOT NULL CHECK(category IN ('financial','transportation','meals','housing','childcare','treatment','emotional','work')),
  location text NOT NULL DEFAULT '' CHECK(char_length(location)<=160),
  website_url text NOT NULL DEFAULT '' CHECK(char_length(website_url)<=2048),
  phone text NOT NULL DEFAULT '' CHECK(char_length(phone)<=40),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX resources_directory ON resources(is_active,category,created_at DESC);
