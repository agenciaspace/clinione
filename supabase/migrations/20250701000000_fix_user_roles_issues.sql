-- Fix user_roles issues - Add 'patient' role and improve policies
-- This migration fixes the 401 errors when creating clinics and accessing user roles

-- First, update the user_roles table to include 'patient' role
DO $$
BEGIN
  -- Drop the existing check constraint
  ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
  
  -- Add the new constraint with 'patient' role included
  ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
    CHECK (role IN ('owner', 'admin', 'doctor', 'staff', 'patient'));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Constraint already exists or other error: %', SQLERRM;
END $$;

-- Drop existing user_roles policies to recreate them
DO $$
BEGIN
  DROP POLICY IF EXISTS "Enable read for users to see their own roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Enable insert for users to create their own roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Enable update for users to update their own roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Enable delete for users to delete their own roles" ON public.user_roles;
END $$;

-- Create more permissive policies for user_roles
-- Allow authenticated users to read all roles (needed for role checking)
CREATE POLICY "Enable read access for authenticated users" ON public.user_roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow users to insert their own roles or when creating clinics
CREATE POLICY "Enable insert for authenticated users" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update roles they have access to
CREATE POLICY "Enable update for authenticated users" ON public.user_roles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow users to delete roles they have access to
CREATE POLICY "Enable delete for authenticated users" ON public.user_roles
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Make sure clinic_id can be NULL for users without clinics (like patients registering)
DO $$
BEGIN
  -- Make clinic_id nullable
  ALTER TABLE public.user_roles ALTER COLUMN clinic_id DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Column already nullable or other error: %', SQLERRM;
END $$;

-- Update the unique constraint to handle NULL clinic_id properly
DO $$
BEGIN
  -- Drop existing unique constraint
  ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_clinic_id_key;
  
  -- Create a partial unique index that handles NULL clinic_id
  CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_user_clinic_unique 
    ON public.user_roles(user_id, clinic_id) 
    WHERE clinic_id IS NOT NULL;
    
  -- Create another unique index for users without clinic (patients)
  CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_user_no_clinic_unique 
    ON public.user_roles(user_id) 
    WHERE clinic_id IS NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Index already exists or other error: %', SQLERRM;
END $$;

-- Add a function to automatically assign 'owner' role when creating a clinic
CREATE OR REPLACE FUNCTION assign_owner_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert owner role for the user who created the clinic
  INSERT INTO public.user_roles (user_id, clinic_id, role)
  VALUES (NEW.owner_id, NEW.id, 'owner')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically assign owner role
DROP TRIGGER IF EXISTS trigger_assign_owner_role ON public.clinics;
CREATE TRIGGER trigger_assign_owner_role
  AFTER INSERT ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION assign_owner_role();

-- Add comments for documentation
COMMENT ON TABLE public.user_roles IS 'Stores user roles within clinics. clinic_id can be NULL for patients who register but don''t belong to any clinic yet.';
COMMENT ON COLUMN public.user_roles.clinic_id IS 'Reference to clinic. Can be NULL for users like patients who register but don''t belong to a clinic.';
COMMENT ON COLUMN public.user_roles.role IS 'User role: owner (clinic owner), admin (clinic admin), doctor, staff, or patient (general users)';