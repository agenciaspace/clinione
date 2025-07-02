-- Fix RLS policies v3 - More comprehensive fix for patient_records and user_roles
-- This migration ensures authenticated users can properly insert records

-- First, drop all existing policies to start fresh
DO $$
BEGIN
  -- Drop patient_records policies
  DROP POLICY IF EXISTS "Users can read patient records in their clinic" ON public.patient_records;
  DROP POLICY IF EXISTS "Users can insert patient records in their clinic" ON public.patient_records;
  DROP POLICY IF EXISTS "Users can update patient records in their clinic" ON public.patient_records;
  DROP POLICY IF EXISTS "Users can delete patient records in their clinic" ON public.patient_records;
  DROP POLICY IF EXISTS "Allow authenticated users to access patient records" ON public.patient_records;
  DROP POLICY IF EXISTS "Allow authenticated users to read patient records" ON public.patient_records;
  DROP POLICY IF EXISTS "Allow authenticated users to insert patient records" ON public.patient_records;
  DROP POLICY IF EXISTS "Allow authenticated users to update patient records" ON public.patient_records;
  DROP POLICY IF EXISTS "Allow authenticated users to delete patient records" ON public.patient_records;
  
  -- Drop patient_record_audit policies
  DROP POLICY IF EXISTS "Users can read patient record audit in their clinic" ON public.patient_record_audit;
  DROP POLICY IF EXISTS "Users can insert patient record audit in their clinic" ON public.patient_record_audit;
  DROP POLICY IF EXISTS "Allow authenticated users to access patient record audit" ON public.patient_record_audit;
  DROP POLICY IF EXISTS "Allow authenticated users to read patient record audit" ON public.patient_record_audit;
  DROP POLICY IF EXISTS "Allow authenticated users to insert patient record audit" ON public.patient_record_audit;
  
  -- Drop user_roles policies
  DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Admins can manage user roles in their clinic" ON public.user_roles;
  DROP POLICY IF EXISTS "Allow users to read their own roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Allow authenticated users to insert their roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Allow authenticated users to update their roles" ON public.user_roles;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_record_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create new, more permissive policies for patient_records
CREATE POLICY "Enable read access for authenticated users" ON public.patient_records
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON public.patient_records
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.patient_records
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.patient_records
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create policies for patient_record_audit
CREATE POLICY "Enable read access for authenticated users" ON public.patient_record_audit
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON public.patient_record_audit
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create policies for user_roles
CREATE POLICY "Enable read for users to see their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Enable insert for users to create their own roles" ON public.user_roles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update for users to update their own roles" ON public.user_roles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Enable delete for users to delete their own roles" ON public.user_roles
  FOR DELETE USING (user_id = auth.uid());

-- Add clinic_id column to user_roles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_roles' AND column_name = 'clinic_id') THEN
    ALTER TABLE public.user_roles ADD COLUMN clinic_id UUID REFERENCES public.clinics(id);
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_patient_records_patient_id ON public.patient_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_record_audit_record_id ON public.patient_record_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Enable realtime
ALTER TABLE public.patient_records REPLICA IDENTITY FULL;
ALTER TABLE public.patient_record_audit REPLICA IDENTITY FULL;
ALTER TABLE public.user_roles REPLICA IDENTITY FULL; 