-- Ensure auth.identities row exists for admin email
DO $$
DECLARE
  uid uuid := 'd5924533-5812-4009-83b8-32925e067d76';
  admin_email text := 'jamestimothyaja@gmail.com';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE provider = 'email' AND provider_id = admin_email) THEN
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      uid,
      jsonb_build_object('sub', uid::text, 'email', admin_email),
      'email',
      admin_email,
      now(),
      now(),
      now()
    );
  END IF;
END $$;
