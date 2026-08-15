ALTER TABLE portfolio_reviews
  ADD COLUMN IF NOT EXISTS reviewer_name text,
  ADD COLUMN IF NOT EXISTS public_email text,
  ADD COLUMN IF NOT EXISTS public_phone text,
  ADD COLUMN IF NOT EXISTS contact_consent boolean NOT NULL DEFAULT false;

ALTER TABLE portfolio_reviews DROP CONSTRAINT IF EXISTS portfolio_reviews_public_contact_check;
ALTER TABLE portfolio_reviews ADD CONSTRAINT portfolio_reviews_public_contact_check CHECK (
  review_text IS NULL OR (
    contact_consent = true AND
    (NULLIF(trim(public_email), '') IS NOT NULL OR NULLIF(trim(public_phone), '') IS NOT NULL)
  )
) NOT VALID;
