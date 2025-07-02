export type UserRole = 'super_admin' | 'owner' | 'admin' | 'doctor' | 'staff' | 'receptionist' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  clinicId?: string;
  clinics?: string[]; // Ids of clinics the user has access to
}

export type WorkingHourPeriod = { start: string; end: string }[];

export type WorkingHours = {
  monday: WorkingHourPeriod;
  tuesday: WorkingHourPeriod;
  wednesday: WorkingHourPeriod;
  thursday: WorkingHourPeriod;
  friday: WorkingHourPeriod;
  saturday: WorkingHourPeriod;
  sunday: WorkingHourPeriod;
};

export interface Clinic {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  workingHours?: WorkingHours;
  slug: string; 
  owner_id: string; // ID do proprietário da clínica
  is_published?: boolean;
  url_format?: string;
}

export interface Doctor {
  id: string;
  name: string;
  speciality: string;
  licensenumber: string; // Changed from licenseNumber to licensenumber to match DB column
  bio?: string;
  email?: string;
  phone?: string;
  clinic_id: string;
  working_hours?: WorkingHours; // Individual working hours for each doctor
  created_at?: string;
  updated_at?: string;
}

export interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
}

export interface Patient {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address?: string;
  medicalHistory?: string;
  clinicId?: string;
  clinic_id?: string; // Adicionado para compatibilidade com o formato do Supabase
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  lastVisit?: string;
  last_visit?: string;
}

export interface Appointment {
  id: string;
  patient_name: string;
  doctor_name?: string;
  doctor_id?: string;
  date: string; // ISO date string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  type: 'in-person' | 'online';
  clinic_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // em minutos
  price: number;
  clinicId: string;
}

export interface Transaction {
  id: string;
  clinic_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending';
  date: string;
  created_at?: string;
  updated_at?: string;
}
