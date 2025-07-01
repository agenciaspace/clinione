export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          date: string
          doctor_id: string | null
          doctor_name: string | null
          id: string
          insurance_company_id: string | null
          notes: string | null
          patient_name: string
          payment_type: string | null
          procedure_id: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          date: string
          doctor_id?: string | null
          doctor_name?: string | null
          id?: string
          insurance_company_id?: string | null
          notes?: string | null
          patient_name: string
          payment_type?: string | null
          procedure_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          date?: string
          doctor_id?: string | null
          doctor_name?: string | null
          id?: string
          insurance_company_id?: string | null
          notes?: string | null
          patient_name?: string
          payment_type?: string | null
          procedure_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      audiences: {
        Row: {
          actual_size: number | null
          clinic_id: string
          created_at: string
          description: string | null
          estimated_size: number | null
          filters: Json
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          actual_size?: number | null
          clinic_id: string
          created_at?: string
          description?: string | null
          estimated_size?: number | null
          filters?: Json
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          actual_size?: number | null
          clinic_id?: string
          created_at?: string
          description?: string | null
          estimated_size?: number | null
          filters?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audiences_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          email_config: Json | null
          facebook_id: string | null
          id: string
          instagram_id: string | null
          is_published: boolean | null
          last_published_at: string | null
          logo: string | null
          name: string
          owner_id: string
          phone: string | null
          photo: string | null
          slug: string | null
          specialties: string[] | null
          state: string | null
          updated_at: string
          url_format: string | null
          webhook_secret: string | null
          webhook_url: string | null
          website: string | null
          working_hours: Json | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          email_config?: Json | null
          facebook_id?: string | null
          id?: string
          instagram_id?: string | null
          is_published?: boolean | null
          last_published_at?: string | null
          logo?: string | null
          name: string
          owner_id: string
          phone?: string | null
          photo?: string | null
          slug?: string | null
          specialties?: string[] | null
          state?: string | null
          updated_at?: string
          url_format?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
          website?: string | null
          working_hours?: Json | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          email_config?: Json | null
          facebook_id?: string | null
          id?: string
          instagram_id?: string | null
          is_published?: boolean | null
          last_published_at?: string | null
          logo?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          photo?: string | null
          slug?: string | null
          specialties?: string[] | null
          state?: string | null
          updated_at?: string
          url_format?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
          website?: string | null
          working_hours?: Json | null
          zip?: string | null
        }
        Relationships: []
      }
      dead_webhook_events: {
        Row: {
          attempts: number
          clinic_id: string
          created_at: string
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          last_attempt: string | null
          payload: Json
          updated_at: string
        }
        Insert: {
          attempts: number
          clinic_id: string
          created_at?: string
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          last_attempt?: string | null
          payload: Json
          updated_at?: string
        }
        Update: {
          attempts?: number
          clinic_id?: string
          created_at?: string
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          last_attempt?: string | null
          payload?: Json
          updated_at?: string
        }
        Relationships: []
      }
      doctor_availability: {
        Row: {
          clinic_id: string
          created_at: string
          doctor_id: string
          duration_minutes: number
          id: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          doctor_id: string
          duration_minutes?: number
          id?: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          doctor_id?: string
          duration_minutes?: number
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_availability_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_availability_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          addresses: Json | null
          bio: string | null
          clinic_id: string | null
          created_at: string | null
          email: string | null
          id: string
          licensenumber: string | null
          name: string
          phone: string | null
          photo_url: string | null
          speciality: string | null
          updated_at: string | null
          working_hours: Json | null
        }
        Insert: {
          addresses?: Json | null
          bio?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          licensenumber?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          speciality?: string | null
          updated_at?: string | null
          working_hours?: Json | null
        }
        Update: {
          addresses?: Json | null
          bio?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          licensenumber?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          speciality?: string | null
          updated_at?: string | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      email_automations: {
        Row: {
          clinic_id: string
          created_at: string
          email_template: Json
          id: string
          is_active: boolean | null
          trigger: Json
          type: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          email_template: Json
          id?: string
          is_active?: boolean | null
          trigger: Json
          type: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          email_template?: Json
          id?: string
          is_active?: boolean | null
          trigger?: Json
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_automations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          clinic_id: string
          created_at: string
          html_content: string
          id: string
          is_active: boolean
          subject: string
          template_type: string
          text_content: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          html_content: string
          id?: string
          is_active?: boolean
          subject: string
          template_type: string
          text_content: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          html_content?: string
          id?: string
          is_active?: boolean
          subject?: string
          template_type?: string
          text_content?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_categories: {
        Row: {
          clinic_id: string | null
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_categories_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_forecasts: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          created_at: string
          description: string
          doctor_id: string | null
          expected_payment_date: string
          glosa_appeal_status: string | null
          glosa_reason: string | null
          glosa_value: number | null
          id: string
          insurance_company_id: string | null
          patient_id: string | null
          payment_type: string
          procedure_id: string | null
          reconciled_transaction_id: string | null
          status: string
          tiss_batch_id: string | null
          updated_at: string
          value: number
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          created_at?: string
          description: string
          doctor_id?: string | null
          expected_payment_date: string
          glosa_appeal_status?: string | null
          glosa_reason?: string | null
          glosa_value?: number | null
          id?: string
          insurance_company_id?: string | null
          patient_id?: string | null
          payment_type: string
          procedure_id?: string | null
          reconciled_transaction_id?: string | null
          status: string
          tiss_batch_id?: string | null
          updated_at?: string
          value: number
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          created_at?: string
          description?: string
          doctor_id?: string | null
          expected_payment_date?: string
          glosa_appeal_status?: string | null
          glosa_reason?: string | null
          glosa_value?: number | null
          id?: string
          insurance_company_id?: string | null
          patient_id?: string | null
          payment_type?: string
          procedure_id?: string | null
          reconciled_transaction_id?: string | null
          status?: string
          tiss_batch_id?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_forecasts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_forecasts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_forecasts_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_forecasts_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_forecasts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_forecasts_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_settings: {
        Row: {
          cancellation_fee_percentage: number
          cancellation_tolerance_hours: number
          clinic_id: string
          created_at: string
          default_insurance_payment_term: number
          id: string
          updated_at: string
        }
        Insert: {
          cancellation_fee_percentage?: number
          cancellation_tolerance_hours?: number
          clinic_id: string
          created_at?: string
          default_insurance_payment_term?: number
          id?: string
          updated_at?: string
        }
        Update: {
          cancellation_fee_percentage?: number
          cancellation_tolerance_hours?: number
          clinic_id?: string
          created_at?: string
          default_insurance_payment_term?: number
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_settings_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_companies: {
        Row: {
          clinic_id: string
          code: string | null
          created_at: string
          id: string
          name: string
          payment_term: number
          updated_at: string
        }
        Insert: {
          clinic_id: string
          code?: string | null
          created_at?: string
          id?: string
          name: string
          payment_term?: number
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          payment_term?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_companies_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          audience_id: string | null
          clicked: number | null
          clinic_id: string
          content: string | null
          created_at: string
          id: string
          name: string
          opened: number | null
          scheduled_date: string | null
          sent: number | null
          status: string
          subject: string | null
          type: string
          updated_at: string
        }
        Insert: {
          audience_id?: string | null
          clicked?: number | null
          clinic_id: string
          content?: string | null
          created_at?: string
          id?: string
          name: string
          opened?: number | null
          scheduled_date?: string | null
          sent?: number | null
          status?: string
          subject?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          audience_id?: string | null
          clicked?: number | null
          clinic_id?: string
          content?: string | null
          created_at?: string
          id?: string
          name?: string
          opened?: number | null
          scheduled_date?: string | null
          sent?: number | null
          status?: string
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          created_at: string
          error_message: string | null
          id: string
          notification_queue_id: string | null
          notification_type: string
          patient_id: string | null
          recipient_email: string
          sent_at: string
          status: string
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          notification_queue_id?: string | null
          notification_type: string
          patient_id?: string | null
          recipient_email: string
          sent_at: string
          status: string
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          notification_queue_id?: string | null
          notification_type?: string
          patient_id?: string | null
          recipient_email?: string
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_notification_queue_id_fkey"
            columns: ["notification_queue_id"]
            isOneToOne: false
            referencedRelation: "notification_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          appointment_cancellations: boolean
          appointment_confirmations: boolean
          appointment_reminders: boolean
          clinic_id: string
          created_at: string
          email_notifications: boolean
          id: string
          reminder_hours_before: number
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_cancellations?: boolean
          appointment_confirmations?: boolean
          appointment_reminders?: boolean
          clinic_id: string
          created_at?: string
          email_notifications?: boolean
          id?: string
          reminder_hours_before?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_cancellations?: boolean
          appointment_confirmations?: boolean
          appointment_reminders?: boolean
          clinic_id?: string
          created_at?: string
          email_notifications?: boolean
          id?: string
          reminder_hours_before?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          appointment_id: string | null
          clinic_id: string
          created_at: string
          error_message: string | null
          html_content: string
          id: string
          max_retries: number
          notification_type: string
          patient_id: string | null
          recipient_email: string
          retry_count: number
          scheduled_for: string
          sent_at: string | null
          status: string
          subject: string
          text_content: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          clinic_id: string
          created_at?: string
          error_message?: string | null
          html_content: string
          id?: string
          max_retries?: number
          notification_type: string
          patient_id?: string | null
          recipient_email: string
          retry_count?: number
          scheduled_for: string
          sent_at?: string | null
          status?: string
          subject: string
          text_content: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string
          created_at?: string
          error_message?: string | null
          html_content?: string
          id?: string
          max_retries?: number
          notification_type?: string
          patient_id?: string | null
          recipient_email?: string
          retry_count?: number
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subject?: string
          text_content?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_record_audit: {
        Row: {
          action: string
          content_after: string | null
          content_before: string | null
          created_at: string
          id: string
          record_id: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          content_after?: string | null
          content_before?: string | null
          created_at?: string
          id?: string
          record_id: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          content_after?: string | null
          content_before?: string | null
          created_at?: string
          id?: string
          record_id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_record_audit_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_records: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          created_by_name: string | null
          id: string
          patient_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          patient_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          patient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          birth_date: string
          clinic_id: string | null
          created_at: string | null
          email: string | null
          id: string
          last_visit: string | null
          name: string
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date: string
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_visit?: string | null
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_visit?: string | null
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          clinic_id: string
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          value_insurance: number | null
          value_private: number
        }
        Insert: {
          clinic_id: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          value_insurance?: number | null
          value_private: number
        }
        Update: {
          clinic_id?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          value_insurance?: number | null
          value_private?: number
        }
        Relationships: [
          {
            foreignKeyName: "procedures_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          profession: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          profession?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          profession?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      smtp_config: {
        Row: {
          clinic_id: string
          created_at: string
          from_email: string
          from_name: string
          host: string
          id: string
          is_active: boolean
          password: string
          port: number
          updated_at: string
          use_tls: boolean
          username: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          from_email: string
          from_name: string
          host: string
          id?: string
          is_active?: boolean
          password: string
          port?: number
          updated_at?: string
          use_tls?: boolean
          username: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          from_email?: string
          from_name?: string
          host?: string
          id?: string
          is_active?: boolean
          password?: string
          port?: number
          updated_at?: string
          use_tls?: boolean
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "smtp_config_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      tiss_batches: {
        Row: {
          approved_value: number | null
          batch_number: string
          clinic_id: string
          created_at: string
          denied_value: number | null
          id: string
          insurance_company_id: string | null
          response_date: string | null
          response_file_url: string | null
          status: string
          submission_date: string
          total_value: number
          updated_at: string
        }
        Insert: {
          approved_value?: number | null
          batch_number: string
          clinic_id: string
          created_at?: string
          denied_value?: number | null
          id?: string
          insurance_company_id?: string | null
          response_date?: string | null
          response_file_url?: string | null
          status: string
          submission_date?: string
          total_value?: number
          updated_at?: string
        }
        Update: {
          approved_value?: number | null
          batch_number?: string
          clinic_id?: string
          created_at?: string
          denied_value?: number | null
          id?: string
          insurance_company_id?: string | null
          response_date?: string | null
          response_file_url?: string | null
          status?: string
          submission_date?: string
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tiss_batches_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiss_batches_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          clinic_id: string
          created_at: string
          date: string
          description: string
          id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          clinic_id: string
          created_at?: string
          date?: string
          description: string
          id?: string
          status: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          clinic_id?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      transcriptions: {
        Row: {
          audio_url: string
          created_at: string
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string | null
          transcription_text: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          transcription_text: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          transcription_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          clinic_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          clinic_id: string
          created_at: string
          description: string | null
          event_types: string[] | null
          id: string
          is_active: boolean
          secret: string | null
          updated_at: string
          url: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          description?: string | null
          event_types?: string[] | null
          id?: string
          is_active?: boolean
          secret?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          description?: string | null
          event_types?: string[] | null
          id?: string
          is_active?: boolean
          secret?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          attempts: number
          clinic_id: string
          created_at: string
          event_type: string
          event_version: string
          http_status: number | null
          id: string
          last_attempt: string | null
          last_response: string | null
          payload: Json
          status: string
          timestamp: string
          trigger_source: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          clinic_id: string
          created_at?: string
          event_type: string
          event_version?: string
          http_status?: number | null
          id?: string
          last_attempt?: string | null
          last_response?: string | null
          payload: Json
          status?: string
          timestamp?: string
          trigger_source?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          clinic_id?: string
          created_at?: string
          event_type?: string
          event_version?: string
          http_status?: number | null
          id?: string
          last_attempt?: string | null
          last_response?: string | null
          payload?: Json
          status?: string
          timestamp?: string
          trigger_source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string
          event_id: string
          id: string
          next_retry_at: string | null
          response_body: string | null
          response_code: number | null
          retry_count: number
          status: string
          updated_at: string
          webhook_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          next_retry_at?: string | null
          response_body?: string | null
          response_code?: number | null
          retry_count?: number
          status: string
          updated_at?: string
          webhook_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          next_retry_at?: string | null
          response_body?: string | null
          response_code?: number | null
          retry_count?: number
          status?: string
          updated_at?: string
          webhook_id?: string
        }
        Relationships: []
      }
      webhook_retries: {
        Row: {
          created_at: string
          event_id: string
          id: string
          retry_at: string
          status: string
          updated_at: string
          webhook_id: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          retry_at: string
          status?: string
          updated_at?: string
          webhook_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          retry_at?: string
          status?: string
          updated_at?: string
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_retries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "webhook_events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_available_slots: {
        Args: { p_clinic_id: string; p_date: string; p_doctor_id?: string }
        Returns: {
          start_time: string
          end_time: string
          doctor_id: string
          doctor_name: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "doctor" | "receptionist" | "staff" | "patient" | "owner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "doctor", "receptionist", "patient", "owner"],
    },
  },
} as const
