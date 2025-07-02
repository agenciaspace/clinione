-- Final fix for user_roles issues
-- Execute this step by step in Supabase Dashboard -> SQL Editor

-- Step 1: Check current table structure
\d user_roles;

-- Step 2: Check existing constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'user_roles'::regclass;

-- Step 3: Drop the problematic constraint
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Step 4: Add the correct constraint with all roles
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('owner', 'admin', 'doctor', 'staff', 'receptionist', 'patient'));

-- Step 5: Make clinic_id nullable (this might fail if already nullable, that's OK)
ALTER TABLE public.user_roles ALTER COLUMN clinic_id DROP NOT NULL;

-- Step 6: Drop and recreate RLS policies
DROP POLICY IF EXISTS "Enable read for users to see their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for users to create their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for users to update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable delete for users to delete their own roles" ON public.user_roles;

-- Step 7: Create new permissive policies
CREATE POLICY "Enable read access for authenticated users" ON public.user_roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.user_roles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.user_roles
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Step 8: Create function to auto-assign owner role
CREATE OR REPLACE FUNCTION assign_owner_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, clinic_id, role)
  VALUES (NEW.owner_id, NEW.id, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create trigger
DROP TRIGGER IF EXISTS trigger_assign_owner_role ON public.clinics;
CREATE TRIGGER trigger_assign_owner_role
  AFTER INSERT ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION assign_owner_role();