-- Seed an admin auth user and link into admin_users
-- IMPORTANT: Replace 'YOUR_ADMIN_EMAIL' and 'YOUR_SECURE_PASSWORD' below before running
-- Requires service role or SQL editor with elevated privileges.

DO $$
DECLARE
  admin_email text := 'YOUR_ADMIN_EMAIL';
  admin_password text := 'YOUR_SECURE_PASSWORD';
  admin_id uuid;
BEGIN
  -- Create auth user if missing
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at)
    VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      NOW(),
      '{}',
      '{"provider":"email","providers":["email"]}',
      NOW(),
      NOW()
    );
  ELSE
    SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
  END IF;

  -- Link to admin_users for RLS admin access
  INSERT INTO admin_users (id, email)
  VALUES (admin_id, admin_email)
  ON CONFLICT (id) DO NOTHING;
END $$;
