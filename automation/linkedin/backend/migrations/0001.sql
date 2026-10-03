PRAGMA foreign_keys = ON;

CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE blogs (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

-- Separate from the queue: deleting/cancelling a post never forgets a seen slug.
CREATE TABLE seen_slugs (
  slug TEXT PRIMARY KEY,
  first_seen_at TEXT NOT NULL
);

CREATE TABLE posts (
  slug TEXT PRIMARY KEY REFERENCES blogs(slug),
  caption TEXT NOT NULL CHECK (length(caption) BETWEEN 1 AND 3000),
  due_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('pending', 'publishing', 'posted', 'retry', 'blocked',
               'ambiguous', 'cancelled', 'dry_run')
  ),
  last_error TEXT,
  linkedin_id TEXT,
  claim_id TEXT,
  lease_until INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX posts_due ON posts(status, due_at);
