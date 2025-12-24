-- Create mailjet_settings table
CREATE TABLE IF NOT EXISTS mailjet_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial Mailjet configuration
INSERT INTO mailjet_settings (api_key, api_secret, from_email, from_name)
VALUES (
  '18b53f83d03da07453157fe59b26484e',
  '40748b4d6df7baee04b541edc516fc99',
  'noreply@yourdomain.com',
  'Your Name'
)
ON CONFLICT DO NOTHING;
