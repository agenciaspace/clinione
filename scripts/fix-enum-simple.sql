-- Simple fix for user_role ENUM issues
-- Execute each statement separately in Supabase Dashboard -> SQL Editor

-- Step 1: Check what type of constraint we have
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'user_roles' AND tc.constraint_type = 'CHECK';

-- Step 2: Check if there's an ENUM type
SELECT typname FROM pg_type WHERE typname = 'user_role';

-- Step 3: If there's an ENUM, add missing values
-- ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';
-- ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'patient';
-- ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'receptionist';

-- Step 4: If there's only a CHECK constraint, replace it
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('owner', 'admin', 'doctor', 'staff', 'receptionist', 'patient'));

-- Step 5: Make clinic_id nullable
ALTER TABLE public.user_roles ALTER COLUMN clinic_id DROP NOT NULL;

-- Step 6: Update RLS policies
DROP POLICY IF EXISTS "Enable read for users to see their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for users to create their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for users to update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable delete for users to delete their own roles" ON public.user_roles;

CREATE POLICY "Enable read access for authenticated users" ON public.user_roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.user_roles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.user_roles
  FOR DELETE USING (auth.uid() IS NOT NULL);