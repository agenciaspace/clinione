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
          notes: string | null
          patient_name: string
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          date: string
          doctor_id?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
          patient_name: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          date?: string
          doctor_id?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
          patient_name?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
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
        ]
      }
      clinics: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          facebook_id: string | null
          id: string
          instagram_id: string | null
          is_published: boolean | null
          last_published_at: string | null
          logo: string | null
          name: string
          owner_id: string
          phone: string | null
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
          facebook_id?: string | null
          id?: string
          instagram_id?: string | null
          is_published?: boolean | null
          last_published_at?: string | null
          logo?: string | null
          name: string
          owner_id: string
          phone?: string | null
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
          facebook_id?: string | null
          id?: string
          instagram_id?: string | null
          is_published?: boolean | null
          last_published_at?: string | null
          logo?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
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
      doctors: {
        Row: {
          bio: string | null
          clinic_id: string | null
          created_at: string | null
          email: string | null
          id: string
          licensenumber: string | null
          name: string
          phone: string | null
          speciality: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          licensenumber?: string | null
          name: string
          phone?: string | null
          speciality?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          licensenumber?: string | null
          name?: string
          phone?: string | null
          speciality?: string | null
          updated_at?: string | null
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
      transactions: {
        Row: {
          amount: number
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
            foreignKeyName: "transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "doctor" | "receptionist" | "patient"
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
      user_role: ["admin", "doctor", "receptionist", "patient"],
    },
  },
} as const
