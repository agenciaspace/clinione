-- Add user archival system to comply with medical record retention laws
-- Medical records must be preserved for 5 years even after user deletion

-- Add archival fields to users table (auth.users is managed by Supabase)
-- We'll use user_roles table to track archival status
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS archival_reason TEXT,
ADD COLUMN IF NOT EXISTS original_user_data JSONB; -- Store original user info

-- Add archival fields to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id);

-- Add archival fields to patient_records table
ALTER TABLE public.patient_records 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id);

-- Add archival fields to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS original_user_data JSONB; -- Store original user info

-- Add archival fields to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id);

-- Create archived_medical_data table for comprehensive archival
CREATE TABLE IF NOT EXISTS public.archived_medical_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_table TEXT NOT NULL, -- 'appointments', 'patient_records', etc.
  original_id UUID NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id),
  archived_user_id UUID, -- Original user ID (may no longer exist in auth.users)
  archived_user_data JSONB NOT NULL, -- Complete user information at time of archival
  medical_data JSONB NOT NULL, -- Complete medical record data
  related_entities JSONB DEFAULT '{}', -- Related data (patient info, doctor info, etc.)
  archival_reason TEXT NOT NULL,
  archived_by UUID REFERENCES auth.users(id) NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  legal_retention_until DATE NOT NULL, -- 5 years from archival date
  
  -- Ensure unique archival per record
  UNIQUE(original_table, original_id)
);

-- Create indexes for archived data
CREATE INDEX IF NOT EXISTS idx_archived_medical_data_clinic_id ON public.archived_medical_data(clinic_id);
CREATE INDEX IF NOT EXISTS idx_archived_medical_data_archived_user_id ON public.archived_medical_data(archived_user_id);
CREATE INDEX IF NOT EXISTS idx_archived_medical_data_retention_date ON public.archived_medical_data(legal_retention_until);
CREATE INDEX IF NOT EXISTS idx_archived_medical_data_original ON public.archived_medical_data(original_table, original_id);

-- Create indexes for archival fields
CREATE INDEX IF NOT EXISTS idx_user_roles_archived ON public.user_roles(is_archived, archived_at);
CREATE INDEX IF NOT EXISTS idx_appointments_archived ON public.appointments(is_archived, archived_at);
CREATE INDEX IF NOT EXISTS idx_patient_records_archived ON public.patient_records(is_archived, archived_at);
CREATE INDEX IF NOT EXISTS idx_doctors_archived ON public.doctors(is_archived, archived_at);
CREATE INDEX IF NOT EXISTS idx_patients_archived ON public.patients(is_archived, archived_at);

-- Enable RLS for archived_medical_data
ALTER TABLE public.archived_medical_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for archived medical data (only clinic owners/admins can access)
CREATE POLICY "Clinic admins can access archived medical data" ON public.archived_medical_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = archived_medical_data.clinic_id 
        AND ur.role IN ('owner', 'admin')
    )
  );

-- Function to archive user and all related medical data
CREATE OR REPLACE FUNCTION archive_user_medical_data(
  target_user_id UUID,
  target_clinic_id UUID,
  archival_reason TEXT DEFAULT 'User account deletion'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  archived_count INTEGER := 0;
  user_info JSONB;
  doctor_info JSONB;
  result JSONB;
BEGIN
  -- Get current user info from auth.users (if still exists)
  SELECT to_jsonb(au.*) INTO user_info
  FROM auth.users au 
  WHERE au.id = target_user_id;
  
  -- Get doctor info if user is a doctor
  SELECT to_jsonb(d.*) INTO doctor_info
  FROM public.doctors d 
  WHERE d.user_id = target_user_id AND d.clinic_id = target_clinic_id;
  
  -- Archive appointments where user was the doctor
  INSERT INTO public.archived_medical_data (
    original_table,
    original_id,
    clinic_id,
    archived_user_id,
    archived_user_data,
    medical_data,
    related_entities,
    archival_reason,
    archived_by,
    legal_retention_until
  )
  SELECT 
    'appointments',
    a.id,
    a.clinic_id,
    target_user_id,
    COALESCE(user_info, '{}'),
    to_jsonb(a.*),
    jsonb_build_object(
      'patient_name', a.patient_name,
      'doctor_name', a.doctor_name,
      'doctor_info', doctor_info
    ),
    archival_reason,
    auth.uid(),
    CURRENT_DATE + INTERVAL '5 years'
  FROM public.appointments a
  WHERE a.doctor_id = target_user_id 
    AND a.clinic_id = target_clinic_id
    AND NOT a.is_archived;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  -- Mark appointments as archived
  UPDATE public.appointments 
  SET 
    is_archived = TRUE,
    archived_at = NOW(),
    archived_by = auth.uid()
  WHERE doctor_id = target_user_id 
    AND clinic_id = target_clinic_id
    AND NOT is_archived;
  
  -- Archive patient records created by the user
  INSERT INTO public.archived_medical_data (
    original_table,
    original_id,
    clinic_id,
    archived_user_id,
    archived_user_data,
    medical_data,
    related_entities,
    archival_reason,
    archived_by,
    legal_retention_until
  )
  SELECT 
    'patient_records',
    pr.id,
    pr.clinic_id,
    target_user_id,
    COALESCE(user_info, '{}'),
    to_jsonb(pr.*),
    jsonb_build_object(
      'patient_id', pr.patient_id,
      'record_type', pr.type
    ),
    archival_reason,
    auth.uid(),
    CURRENT_DATE + INTERVAL '5 years'
  FROM public.patient_records pr
  WHERE pr.created_by = target_user_id 
    AND pr.clinic_id = target_clinic_id
    AND NOT pr.is_archived;
  
  -- Mark patient records as archived
  UPDATE public.patient_records 
  SET 
    is_archived = TRUE,
    archived_at = NOW(),
    archived_by = auth.uid()
  WHERE created_by = target_user_id 
    AND clinic_id = target_clinic_id
    AND NOT is_archived;
  
  -- Archive doctor profile if user is a doctor
  IF doctor_info IS NOT NULL THEN
    INSERT INTO public.archived_medical_data (
      original_table,
      original_id,
      clinic_id,
      archived_user_id,
      archived_user_data,
      medical_data,
      related_entities,
      archival_reason,
      archived_by,
      legal_retention_until
    )
    VALUES (
      'doctors',
      (doctor_info->>'id')::UUID,
      target_clinic_id,
      target_user_id,
      COALESCE(user_info, '{}'),
      doctor_info,
      jsonb_build_object(),
      archival_reason,
      auth.uid(),
      CURRENT_DATE + INTERVAL '5 years'
    );
    
    -- Mark doctor as archived
    UPDATE public.doctors 
    SET 
      is_archived = TRUE,
      archived_at = NOW(),
      archived_by = auth.uid(),
      original_user_data = user_info
    WHERE user_id = target_user_id 
      AND clinic_id = target_clinic_id
      AND NOT is_archived;
  END IF;
  
  -- Archive user role
  UPDATE public.user_roles 
  SET 
    is_archived = TRUE,
    archived_at = NOW(),
    archived_by = auth.uid(),
    archival_reason = archival_reason,
    original_user_data = user_info
  WHERE user_id = target_user_id 
    AND clinic_id = target_clinic_id
    AND NOT is_archived;
  
  -- Prepare result
  result := jsonb_build_object(
    'success', true,
    'archived_records', archived_count,
    'user_id', target_user_id,
    'clinic_id', target_clinic_id,
    'archival_reason', archival_reason,
    'legal_retention_until', CURRENT_DATE + INTERVAL '5 years'
  );
  
  RETURN result;
END;
$$;

-- Function to check if medical data can be permanently deleted (after 5 years)
CREATE OR REPLACE FUNCTION can_delete_archived_data(
  archived_data_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  retention_date DATE;
BEGIN
  SELECT legal_retention_until INTO retention_date
  FROM public.archived_medical_data
  WHERE id = archived_data_id;
  
  RETURN retention_date IS NOT NULL AND retention_date < CURRENT_DATE;
END;
$$;

-- Function to permanently delete archived data after legal retention period
CREATE OR REPLACE FUNCTION delete_expired_archived_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Only allow deletion after 5+ years
  DELETE FROM public.archived_medical_data
  WHERE legal_retention_until < CURRENT_DATE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Enable realtime for archival tracking
ALTER TABLE public.archived_medical_data REPLICA IDENTITY FULL;