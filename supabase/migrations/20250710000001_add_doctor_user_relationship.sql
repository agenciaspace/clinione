-- Add user_id field to doctors table to link doctors with auth users
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);

-- Add unique constraint to ensure one doctor per user per clinic
CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_user_clinic_unique ON public.doctors(user_id, clinic_id) WHERE user_id IS NOT NULL;

-- Update RLS policies for doctors table to include doctor-specific permissions
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.doctors;

-- Doctors can read all doctors in their clinic(s), but only update/delete their own record
CREATE POLICY "Doctors can read all doctors in their clinics" ON public.doctors
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      -- Admins and owners can see all doctors
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = doctors.clinic_id 
        AND ur.role IN ('owner', 'admin')
      )
      OR
      -- Staff can see all doctors in their clinic
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = doctors.clinic_id 
        AND ur.role = 'staff'
      )
      OR
      -- Doctors can see all doctors in their clinic
      EXISTS (
        SELECT 1 FROM public.doctors d 
        WHERE d.user_id = auth.uid() 
        AND d.clinic_id = doctors.clinic_id
      )
    )
  );

-- Only admins and owners can insert new doctors
CREATE POLICY "Only admins can insert doctors" ON public.doctors
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.clinic_id = doctors.clinic_id 
      AND ur.role IN ('owner', 'admin')
    )
  );

-- Doctors can only update their own record, admins can update any
CREATE POLICY "Doctors can update own record, admins can update any" ON public.doctors
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      -- Admins and owners can update any doctor
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = doctors.clinic_id 
        AND ur.role IN ('owner', 'admin')
      )
      OR
      -- Doctors can only update their own record
      doctors.user_id = auth.uid()
    )
  );

-- Only admins and owners can delete doctors
CREATE POLICY "Only admins can delete doctors" ON public.doctors
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.clinic_id = doctors.clinic_id 
      AND ur.role IN ('owner', 'admin')
    )
  );

-- Update RLS policies for appointments to restrict by doctor
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.appointments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.appointments;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.appointments;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.appointments;

-- Appointments read policy: doctors can only see their own appointments
CREATE POLICY "Users can read appointments based on role" ON public.appointments
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      -- Admins and owners can see all appointments
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = appointments.clinic_id 
        AND ur.role IN ('owner', 'admin')
      )
      OR
      -- Staff can see all appointments in their clinic
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = appointments.clinic_id 
        AND ur.role = 'staff'
      )
      OR
      -- Doctors can only see their own appointments
      EXISTS (
        SELECT 1 FROM public.doctors d 
        WHERE d.user_id = auth.uid() 
        AND d.id = appointments.doctor_id
      )
    )
  );

-- Appointments insert policy: doctors can only create appointments for themselves
CREATE POLICY "Users can insert appointments based on role" ON public.appointments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- Admins and owners can create appointments for any doctor
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = appointments.clinic_id 
        AND ur.role IN ('owner', 'admin')
      )
      OR
      -- Staff can create appointments for any doctor in their clinic
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = appointments.clinic_id 
        AND ur.role = 'staff'
      )
      OR
      -- Doctors can only create appointments for themselves
      EXISTS (
        SELECT 1 FROM public.doctors d 
        WHERE d.user_id = auth.uid() 
        AND d.id = appointments.doctor_id
      )
    )
  );

-- Appointments update policy: similar to insert
CREATE POLICY "Users can update appointments based on role" ON public.appointments
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      -- Admins and owners can update any appointment
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = appointments.clinic_id 
        AND ur.role IN ('owner', 'admin')
      )
      OR
      -- Staff can update any appointment in their clinic
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = appointments.clinic_id 
        AND ur.role = 'staff'
      )
      OR
      -- Doctors can only update their own appointments
      EXISTS (
        SELECT 1 FROM public.doctors d 
        WHERE d.user_id = auth.uid() 
        AND d.id = appointments.doctor_id
      )
    )
  );

-- Appointments delete policy: same as update
CREATE POLICY "Users can delete appointments based on role" ON public.appointments
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND (
      -- Admins and owners can delete any appointment
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = appointments.clinic_id 
        AND ur.role IN ('owner', 'admin')
      )
      OR
      -- Staff can delete any appointment in their clinic
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = appointments.clinic_id 
        AND ur.role = 'staff'
      )
      OR
      -- Doctors can only delete their own appointments
      EXISTS (
        SELECT 1 FROM public.doctors d 
        WHERE d.user_id = auth.uid() 
        AND d.id = appointments.doctor_id
      )
    )
  );

-- Update RLS policies for patient_records to restrict by doctor
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.patient_records;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.patient_records;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.patient_records;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.patient_records;

-- Patient records read policy: doctors can only see records they created
CREATE POLICY "Users can read patient records based on role" ON public.patient_records
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      -- Admins and owners can see all records
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = patient_records.clinic_id 
        AND ur.role IN ('owner', 'admin')
      )
      OR
      -- Staff can see all records in their clinic
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = patient_records.clinic_id 
        AND ur.role = 'staff'
      )
      OR
      -- Doctors can only see records they created
      patient_records.created_by = auth.uid()
    )
  );

-- Patient records insert policy: anyone can create, but created_by will be set to current user
CREATE POLICY "Users can insert patient records based on role" ON public.patient_records
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- Admins and owners can create records
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = patient_records.clinic_id 
        AND ur.role IN ('owner', 'admin')
      )
      OR
      -- Staff can create records
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = patient_records.clinic_id 
        AND ur.role = 'staff'
      )
      OR
      -- Doctors can create records (will be automatically assigned to them)
      EXISTS (
        SELECT 1 FROM public.doctors d 
        WHERE d.user_id = auth.uid() 
        AND d.clinic_id = patient_records.clinic_id
      )
    )
  );

-- Patient records update policy: doctors can only update their own records
CREATE POLICY "Users can update patient records based on role" ON public.patient_records
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      -- Admins and owners can update any record
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = patient_records.clinic_id 
        AND ur.role IN ('owner', 'admin')
      )
      OR
      -- Staff can update any record in their clinic
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = patient_records.clinic_id 
        AND ur.role = 'staff'
      )
      OR
      -- Doctors can only update records they created
      patient_records.created_by = auth.uid()
    )
  );

-- Patient records delete policy: same as update
CREATE POLICY "Users can delete patient records based on role" ON public.patient_records
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND (
      -- Admins and owners can delete any record
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = patient_records.clinic_id 
        AND ur.role IN ('owner', 'admin')
      )
      OR
      -- Staff can delete any record in their clinic
      EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.clinic_id = patient_records.clinic_id 
        AND ur.role = 'staff'
      )
      OR
      -- Doctors can only delete records they created
      patient_records.created_by = auth.uid()
    )
  );