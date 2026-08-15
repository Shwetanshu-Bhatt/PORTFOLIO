CREATE TABLE IF NOT EXISTS portfolio_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_token_hash text UNIQUE NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  company text,
  project_id text NOT NULL,
  project_title text NOT NULL,
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  review_text text,
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'pending', 'published', 'hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS portfolio_reviews_public_idx
  ON portfolio_reviews (published_at DESC)
  WHERE status = 'published';
