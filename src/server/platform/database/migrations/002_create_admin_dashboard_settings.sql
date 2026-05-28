CREATE TABLE IF NOT EXISTS admin_dashboard_settings (
  id SMALLINT PRIMARY KEY,
  show_metrics BOOLEAN NOT NULL DEFAULT TRUE,
  refresh_interval_seconds INTEGER NOT NULL DEFAULT 30,
  analytics_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  metrics_window_days INTEGER NOT NULL DEFAULT 30,
  language TEXT NOT NULL DEFAULT 'es-ES',
  currency TEXT NOT NULL DEFAULT 'EUR',
  timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
  admin_email TEXT NULL,
  whatsapp_phone TEXT NULL,
  whatsapp_message TEXT NULL DEFAULT 'Hola, quiero un presupuesto para camisetas corporativas. Nombre, empresa y cantidad:',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_dashboard_settings_singleton CHECK (id = 1),
  CONSTRAINT admin_dashboard_settings_refresh_interval_min CHECK (refresh_interval_seconds >= 5),
  CONSTRAINT admin_dashboard_settings_metrics_window_min CHECK (metrics_window_days >= 1),
  CONSTRAINT admin_dashboard_settings_language_check CHECK (language IN ('es-ES', 'en-US')),
  CONSTRAINT admin_dashboard_settings_currency_check CHECK (currency IN ('EUR', 'USD')),
  CONSTRAINT admin_dashboard_settings_timezone_check CHECK (timezone IN ('Europe/Madrid', 'UTC', 'America/New_York'))
);

INSERT INTO admin_dashboard_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
