-- Add CPF column to patients table
-- This migration adds the CPF (Brazilian tax document) field to the patients table

-- Add CPF column to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Add status column to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Add last_visit column to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS last_visit TIMESTAMP WITH TIME ZONE;

-- Create index for CPF for better performance
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON public.patients(cpf);

-- Create index for status for better performance
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);

-- Add unique constraint for CPF within a clinic to prevent duplicates
-- (A person can't have multiple records with the same CPF in the same clinic)
ALTER TABLE public.patients 
ADD CONSTRAINT unique_cpf_per_clinic 
UNIQUE (cpf, clinic_id);

-- Add comments to the new columns
COMMENT ON COLUMN public.patients.cpf IS 'Brazilian CPF (Cadastro de Pessoas Físicas) document number';
COMMENT ON COLUMN public.patients.status IS 'Patient status - active or inactive';
COMMENT ON COLUMN public.patients.last_visit IS 'Date of the last visit or appointment';