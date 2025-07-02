-- Just diagnose the current state - SAFE TO RUN
-- Execute this first to understand the current schema

-- Check if user_role ENUM exists and what values it has
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- Check the actual column definition
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'role';

-- Check current constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'user_roles';

-- Check current data in the table
SELECT DISTINCT role FROM public.user_roles;