-- Subscribers table for newsletter
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verification_token UUID DEFAULT gen_random_uuid(),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_token ON subscribers(verification_token);

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- No policies for anon users = no access
-- All operations go through Edge Functions using service_role key
