-- Convert user_role from ENUM to TEXT with CHECK constraint
-- This is safer than trying to modify the ENUM
-- Execute step by step

-- Step 1: Change column from ENUM to TEXT
ALTER TABLE public.user_roles ALTER COLUMN role TYPE TEXT;

-- Step 2: Drop the old ENUM type (this will work now that no column uses it)
DROP TYPE IF EXISTS user_role CASCADE;

-- Step 3: Add CHECK constraint with all allowed values
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('owner', 'admin', 'doctor', 'staff', 'receptionist', 'patient'));

-- Step 4: Make clinic_id nullable
ALTER TABLE public.user_roles ALTER COLUMN clinic_id DROP NOT NULL;

-- Step 5: Fix RLS policies
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

-- Step 6: Verify the fix
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'role';