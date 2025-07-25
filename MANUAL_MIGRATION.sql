-- EXECUTE THIS SQL DIRECTLY IN YOUR SUPABASE DASHBOARD
-- Go to: https://supabase.com/dashboard/project/tfkchwuphjaauyfqptbk/sql

-- Add CPF column to patients table (if not exists)
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Add status column to patients table (if not exists)
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Add last_visit column to patients table (if not exists)
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS last_visit TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON public.patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);

-- Add unique constraint for CPF within a clinic to prevent duplicates
-- (A person can't have multiple records with the same CPF in the same clinic)
-- First, let's make sure we don't have duplicates before adding the constraint
DO $$
BEGIN
    -- Only add the constraint if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_cpf_per_clinic' 
        AND table_name = 'patients'
    ) THEN
        ALTER TABLE public.patients 
        ADD CONSTRAINT unique_cpf_per_clinic 
        UNIQUE (cpf, clinic_id);
    END IF;
END $$;

-- Add comments to the new columns
COMMENT ON COLUMN public.patients.cpf IS 'Brazilian CPF (Cadastro de Pessoas Físicas) document number';
COMMENT ON COLUMN public.patients.status IS 'Patient status - active or inactive';
COMMENT ON COLUMN public.patients.last_visit IS 'Date of the last visit or appointment';

-- Show the current structure of the patients table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'patients' AND table_schema = 'public'
ORDER BY ordinal_position;