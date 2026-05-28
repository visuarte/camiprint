CREATE TABLE IF NOT EXISTS admin_dashboard_settings_audit (
  id BIGSERIAL PRIMARY KEY,
  settings_id SMALLINT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by TEXT NULL,
  payload JSONB NOT NULL,
  CONSTRAINT admin_dashboard_settings_audit_settings_fk
    FOREIGN KEY (settings_id) REFERENCES admin_dashboard_settings (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_dashboard_settings_audit_changed_at
  ON admin_dashboard_settings_audit (changed_at DESC);
