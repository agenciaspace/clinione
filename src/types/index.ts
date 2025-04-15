
export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  clinicId?: string;
}

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
  workingHours?: {
    [key: string]: { start: string; end: string }[];
  };
  slug: string; // Para URL personalizada
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  speciality: string;
  licenseNumber: string; // CRM
  bio?: string;
  photo?: string;
  clinicId: string;
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
  clinicId: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO date string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  type: 'in-person' | 'online';
  clinicId: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // em minutos
  price: number;
  clinicId: string;
}
