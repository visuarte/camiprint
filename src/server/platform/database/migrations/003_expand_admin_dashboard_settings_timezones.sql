ALTER TABLE admin_dashboard_settings
  DROP CONSTRAINT IF EXISTS admin_dashboard_settings_timezone_check;

ALTER TABLE admin_dashboard_settings
  ADD CONSTRAINT admin_dashboard_settings_timezone_check
  CHECK (
    timezone IN (
      'Europe/Madrid',
      'UTC',
      'Europe/London',
      'Europe/Berlin',
      'America/New_York',
      'America/Chicago',
      'America/Mexico_City',
      'America/Bogota',
      'America/Lima',
      'America/Santiago',
      'America/Argentina/Buenos_Aires'
    )
  );
