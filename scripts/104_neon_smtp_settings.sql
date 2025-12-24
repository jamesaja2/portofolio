-- SMTP settings table to allow admin-configurable email credentials
CREATE TABLE IF NOT EXISTS smtp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT NOT NULL,
  port INTEGER NOT NULL CHECK (port BETWEEN 1 AND 65535),
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  secure BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure we only ever store a single row (acts like a singleton record)
CREATE UNIQUE INDEX IF NOT EXISTS smtp_settings_singleton_idx ON smtp_settings ((TRUE));

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_smtp_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS smtp_settings_updated_at_trg ON smtp_settings;
CREATE TRIGGER smtp_settings_updated_at_trg
BEFORE UPDATE ON smtp_settings
FOR EACH ROW
EXECUTE FUNCTION update_smtp_settings_updated_at();
