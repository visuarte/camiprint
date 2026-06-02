CREATE TABLE IF NOT EXISTS quote_communication_timeline (
  id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  template_key TEXT NOT NULL,
  message TEXT NOT NULL,
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quote_comm_channel_check CHECK (channel IN ('email', 'whatsapp', 'internal')),
  CONSTRAINT quote_comm_status_check CHECK (status IN ('queued', 'sent', 'failed'))
);

CREATE INDEX IF NOT EXISTS quote_comm_quote_id_created_at_idx
  ON quote_communication_timeline (quote_id, created_at DESC);

CREATE INDEX IF NOT EXISTS quote_comm_event_type_idx
  ON quote_communication_timeline (event_type);
