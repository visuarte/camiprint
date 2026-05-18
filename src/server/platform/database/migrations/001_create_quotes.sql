CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quotes_source_check CHECK (source = 'landing-contact-form'),
  CONSTRAINT quotes_status_check CHECK (status = 'received'),
  CONSTRAINT quotes_quantity_check CHECK (quantity IN ('10-24', '25-49', '50-99', '100+'))
);

CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON quotes (created_at DESC);
CREATE INDEX IF NOT EXISTS quotes_email_idx ON quotes (email);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes (status);
