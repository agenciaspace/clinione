-- Create base tables for the clinic management system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clinics table
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  facebook_id TEXT,
  instagram_id TEXT,
  description TEXT,
  logo TEXT,
  photo TEXT,
  working_hours JSONB DEFAULT '{
    "monday": [{"start": "08:00", "end": "18:00"}],
    "tuesday": [{"start": "08:00", "end": "18:00"}],
    "wednesday": [{"start": "08:00", "end": "18:00"}],
    "thursday": [{"start": "08:00", "end": "18:00"}],
    "friday": [{"start": "08:00", "end": "18:00"}],
    "saturday": [{"start": "08:00", "end": "13:00"}],
    "sunday": []
  }'::jsonb,
  is_published BOOLEAN DEFAULT false,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  speciality TEXT,
  licensenumber TEXT,
  bio TEXT,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  working_hours JSONB DEFAULT '{
    "monday": [{"start": "09:00", "end": "18:00"}],
    "tuesday": [{"start": "09:00", "end": "18:00"}],
    "wednesday": [{"start": "09:00", "end": "18:00"}],
    "thursday": [{"start": "09:00", "end": "18:00"}],
    "friday": [{"start": "09:00", "end": "18:00"}],
    "saturday": [{"start": "09:00", "end": "13:00"}],
    "sunday": []
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE NOT NULL,
  address TEXT,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  patient_email TEXT,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  doctor_name TEXT,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),
  notes TEXT,
  type TEXT DEFAULT 'in-person' CHECK (type IN ('in-person', 'online')),
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_records table
CREATE TABLE IF NOT EXISTS public.patient_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient_record_audit table
CREATE TABLE IF NOT EXISTS public.patient_record_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id UUID REFERENCES public.patient_records(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'doctor', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, clinic_id)
);

-- Create doctor_availability table (for future use)
CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clinics_slug ON public.clinics(slug);
CREATE INDEX IF NOT EXISTS idx_clinics_owner_id ON public.clinics(owner_id);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON public.doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON public.patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_patient_records_patient_id ON public.patient_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_records_clinic_id ON public.patient_records(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_record_audit_record_id ON public.patient_record_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_clinic_id ON public.user_roles(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_id ON public.doctor_availability(doctor_id);

-- Enable RLS on all tables
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_record_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (permissive for authenticated users)
-- Clinics
CREATE POLICY "Enable read access for authenticated users" ON public.clinics
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable insert for authenticated users" ON public.clinics
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated users" ON public.clinics
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete for authenticated users" ON public.clinics
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Doctors
CREATE POLICY "Enable read access for authenticated users" ON public.doctors
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable insert for authenticated users" ON public.doctors
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated users" ON public.doctors
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete for authenticated users" ON public.doctors
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Patients
CREATE POLICY "Enable read access for authenticated users" ON public.patients
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable insert for authenticated users" ON public.patients
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated users" ON public.patients
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete for authenticated users" ON public.patients
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Appointments
CREATE POLICY "Enable read access for authenticated users" ON public.appointments
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable insert for authenticated users" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated users" ON public.appointments
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete for authenticated users" ON public.appointments
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Patient Records (already handled in previous migration)
-- User Roles (already handled in previous migration)
-- Doctor Availability
CREATE POLICY "Enable read access for authenticated users" ON public.doctor_availability
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable insert for authenticated users" ON public.doctor_availability
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated users" ON public.doctor_availability
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete for authenticated users" ON public.doctor_availability
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Enable realtime for all tables
ALTER TABLE public.clinics REPLICA IDENTITY FULL;
ALTER TABLE public.doctors REPLICA IDENTITY FULL;
ALTER TABLE public.patients REPLICA IDENTITY FULL;
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.patient_records REPLICA IDENTITY FULL;
ALTER TABLE public.patient_record_audit REPLICA IDENTITY FULL;
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER TABLE public.doctor_availability REPLICA IDENTITY FULL; 