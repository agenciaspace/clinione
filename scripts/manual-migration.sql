-- Manual migration to fix user_roles 401 errors
-- Execute this SQL in the Supabase Dashboard -> SQL Editor

-- First, check if there's an ENUM type that needs to be updated
DO $$
BEGIN
  -- Check if user_role ENUM exists and update it
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    -- Drop the ENUM type if it exists (this will fail if it's in use)
    -- We'll need to handle this differently if the ENUM is already in use
    RAISE NOTICE 'user_role ENUM type exists, will need to be handled carefully';
    
    -- Add new values to the existing ENUM
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'patient';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'receptionist';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ENUM handling failed or not needed: %', SQLERRM;
END $$;

-- 1. Update the user_roles table constraint to include all roles
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('owner', 'admin', 'doctor', 'staff', 'patient', 'receptionist'));

-- 2. Make clinic_id nullable for users without clinics
ALTER TABLE public.user_roles ALTER COLUMN clinic_id DROP NOT NULL;

-- 3. Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable read for users to see their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for users to create their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for users to update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable delete for users to delete their own roles" ON public.user_roles;

-- 4. Create permissive policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON public.user_roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.user_roles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.user_roles
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 5. Fix unique constraints for NULL clinic_id
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_clinic_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_user_clinic_unique 
  ON public.user_roles(user_id, clinic_id) 
  WHERE clinic_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_user_no_clinic_unique 
  ON public.user_roles(user_id) 
  WHERE clinic_id IS NULL;

-- 6. Create function to auto-assign owner role when creating clinic
CREATE OR REPLACE FUNCTION assign_owner_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, clinic_id, role)
  VALUES (NEW.owner_id, NEW.id, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger
DROP TRIGGER IF EXISTS trigger_assign_owner_role ON public.clinics;
CREATE TRIGGER trigger_assign_owner_role
  AFTER INSERT ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION assign_owner_role();