// Database types - serão gerados automaticamente pelo Supabase CLI
// Por enquanto, definindo interfaces básicas

export interface Database {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string
          name: string
          cnpj?: string
          cpf?: string
          address?: string
          phone?: string
          email?: string
          timezone: string
          logo_url?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clinics']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clinics']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          email: string
          name?: string
          phone?: string
          role: 'admin' | 'doctor' | 'receptionist'
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      professionals: {
        Row: {
          id: string
          profile_id: string
          clinic_id: string
          specialty?: string
          crm?: string
          bio?: string
          consultation_fee?: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['professionals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['professionals']['Insert']>
      }
      patients: {
        Row: {
          id: string
          clinic_id: string
          name: string
          email?: string
          phone: string
          cpf: string
          birth_date?: string
          address?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['patients']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          professional_id: string
          date: string
          time: string
          duration: number // em minutos
          status: 'scheduled' | 'confirmed' | 'arrived' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      medical_records: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          professional_id: string
          appointment_id?: string
          subjective?: string
          objective?: string
          assessment?: string
          plan?: string
          attachments?: string[]
          signed_at?: string
          signed_by?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['medical_records']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['medical_records']['Insert']>
      }
      onboarding_progress: {
        Row: {
          id: string
          clinic_id: string
          current_step: number
          completed_steps: number[]
          data: Record<string, any>
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['onboarding_progress']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['onboarding_progress']['Insert']>
      }
      user_clinics: {
        Row: {
          id: string
          user_id: string
          clinic_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_clinics']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_clinics']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Tipos derivados para uso na aplicação
export type Clinic = Database['public']['Tables']['clinics']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Professional = Database['public']['Tables']['professionals']['Row']
export type Patient = Database['public']['Tables']['patients']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type MedicalRecord = Database['public']['Tables']['medical_records']['Row']
export type OnboardingProgress = Database['public']['Tables']['onboarding_progress']['Row']
export type UserClinics = Database['public']['Tables']['user_clinics']['Row']

// Enums
export type UserRole = Profile['role']
export type AppointmentStatus = Appointment['status']