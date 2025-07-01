-- Fix ENUM user_role specifically
-- Execute this in Supabase Dashboard -> SQL Editor

-- Step 1: Check if user_role ENUM exists and what values it has
SELECT 
    t.typname,
    e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- Step 2: Add missing values to the ENUM (if it exists)
-- Only uncomment the lines for values that don't exist yet

-- ALTER TYPE user_role ADD VALUE 'staff';
-- ALTER TYPE user_role ADD VALUE 'patient';
-- ALTER TYPE user_role ADD VALUE 'receptionist';

-- Step 3: If the above fails, we need to recreate the ENUM
-- First check if the column actually uses the ENUM type
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'role';

-- Step 4: If the column uses the ENUM, we need to change it to TEXT first
-- ALTER TABLE public.user_roles ALTER COLUMN role TYPE TEXT;

-- Step 5: Drop the old ENUM
-- DROP TYPE IF EXISTS user_role;

-- Step 6: Create new ENUM with all values
-- CREATE TYPE user_role AS ENUM ('owner', 'admin', 'doctor', 'staff', 'receptionist', 'patient');

-- Step 7: Change column back to use the new ENUM
-- ALTER TABLE public.user_roles ALTER COLUMN role TYPE user_role USING role::user_role;

-- Alternative: Just use TEXT with CHECK constraint (recommended)
-- ALTER TABLE public.user_roles ALTER COLUMN role TYPE TEXT;
-- ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
--   CHECK (role IN ('owner', 'admin', 'doctor', 'staff', 'receptionist', 'patient'));