-- Create leonhatori@gmail.com user for local development
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'leonhatori@gmail.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Leon Hatori"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Get the user id for further operations
DO $$
DECLARE
  user_id UUID;
  clinic_id UUID;
BEGIN
  -- Get the user id
  SELECT id INTO user_id FROM auth.users WHERE email = 'leonhatori@gmail.com';
  
  -- Get or create a clinic for this user
  SELECT id INTO clinic_id FROM public.clinics WHERE slug = 'dermatologiaparaiso';
  
  IF clinic_id IS NOT NULL AND user_id IS NOT NULL THEN
    -- Create user role as owner
    INSERT INTO public.user_roles (user_id, clinic_id, role) 
    VALUES (user_id, clinic_id, 'owner')
    ON CONFLICT DO NOTHING;
    
    -- Update clinic owner if needed
    UPDATE public.clinics 
    SET owner_id = user_id
    WHERE id = clinic_id AND owner_id IS NULL;
  END IF;
END $$;