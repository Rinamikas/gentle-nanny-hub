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
          booking_expires_at: string | null
          created_at: string
          end_time: string
          id: string
          nanny_id: string
          notes: string | null
          parent_id: string
          photo_url: string | null
          promo_code_id: string | null
          service_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          total_price: number | null
          updated_at: string
        }
        Insert: {
          booking_expires_at?: string | null
          created_at?: string
          end_time: string
          id?: string
          nanny_id: string
          notes?: string | null
          parent_id: string
          photo_url?: string | null
          promo_code_id?: string | null
          service_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          booking_expires_at?: string | null
          created_at?: string
          end_time?: string
          id?: string
          nanny_id?: string
          notes?: string | null
          parent_id?: string
          photo_url?: string | null
          promo_code_id?: string | null
          service_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_nanny_id_fkey"
            columns: ["nanny_id"]
            isOneToOne: false
            referencedRelation: "nanny_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          birth_date: string
          created_at: string
          first_name: string
          gender: string
          id: string
          medical_conditions: string | null
          notes: string | null
          notify_before_birthday: number | null
          parent_profile_id: string | null
          updated_at: string
        }
        Insert: {
          birth_date: string
          created_at?: string
          first_name: string
          gender: string
          id?: string
          medical_conditions?: string | null
          notes?: string | null
          notify_before_birthday?: number | null
          parent_profile_id?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string
          created_at?: string
          first_name?: string
          gender?: string
          id?: string
          medical_conditions?: string | null
          notes?: string | null
          notify_before_birthday?: number | null
          parent_profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "parent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nanny_documents: {
        Row: {
          created_at: string
          file_url: string
          id: string
          nanny_id: string | null
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          nanny_id?: string | null
          type: Database["public"]["Enums"]["document_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          nanny_id?: string | null
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nanny_documents_nanny_id_fkey"
            columns: ["nanny_id"]
            isOneToOne: false
            referencedRelation: "nanny_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nanny_profiles: {
        Row: {
          address: string | null
          age_group: string | null
          birth_date: string | null
          camera_number: string | null
          camera_phone: string | null
          certifications: string[] | null
          created_at: string
          deleted_at: string | null
          education: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          is_deleted: boolean | null
          photo_url: string | null
          position: string | null
          relative_phone: string | null
          specializations: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          age_group?: string | null
          birth_date?: string | null
          camera_number?: string | null
          camera_phone?: string | null
          certifications?: string[] | null
          created_at?: string
          deleted_at?: string | null
          education?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_deleted?: boolean | null
          photo_url?: string | null
          position?: string | null
          relative_phone?: string | null
          specializations?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          age_group?: string | null
          birth_date?: string | null
          camera_number?: string | null
          camera_phone?: string | null
          certifications?: string[] | null
          created_at?: string
          deleted_at?: string | null
          education?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_deleted?: boolean | null
          photo_url?: string | null
          position?: string | null
          relative_phone?: string | null
          specializations?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nanny_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nanny_settings: {
        Row: {
          created_at: string
          id: string
          min_appointment_interval: number
          min_break_duration: number
          nanny_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          min_appointment_interval?: number
          min_break_duration?: number
          nanny_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          min_appointment_interval?: number
          min_break_duration?: number
          nanny_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nanny_settings_nanny_id_fkey"
            columns: ["nanny_id"]
            isOneToOne: true
            referencedRelation: "nanny_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nanny_training: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          nanny_id: string | null
          stage: Database["public"]["Enums"]["training_stage"]
          updated_at: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          nanny_id?: string | null
          stage: Database["public"]["Enums"]["training_stage"]
          updated_at?: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          nanny_id?: string | null
          stage?: Database["public"]["Enums"]["training_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nanny_training_nanny_id_fkey"
            columns: ["nanny_id"]
            isOneToOne: true
            referencedRelation: "nanny_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_profiles: {
        Row: {
          additional_phone: string | null
          address: string | null
          children_count: number | null
          created_at: string
          deleted_at: string | null
          id: string
          is_deleted: boolean | null
          notes: string | null
          special_requirements: string | null
          status: Database["public"]["Enums"]["parent_status"] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_phone?: string | null
          address?: string | null
          children_count?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["parent_status"] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_phone?: string | null
          address?: string | null
          children_count?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["parent_status"] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          discount_percent: number
          id: string
          is_active: boolean | null
          updated_at: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          code: string
          created_at?: string
          discount_percent: number
          id?: string
          is_active?: boolean | null
          updated_at?: string
          valid_from: string
          valid_until: string
        }
        Update: {
          code?: string
          created_at?: string
          discount_percent?: number
          id?: string
          is_active?: boolean | null
          updated_at?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      schedule_events: {
        Row: {
          created_at: string
          end_time: string
          event_type: Database["public"]["Enums"]["schedule_event_type"]
          id: string
          nanny_id: string
          notes: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          event_type: Database["public"]["Enums"]["schedule_event_type"]
          id?: string
          nanny_id: string
          notes?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          event_type?: Database["public"]["Enums"]["schedule_event_type"]
          id?: string
          nanny_id?: string
          notes?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_events_nanny_id_fkey"
            columns: ["nanny_id"]
            isOneToOne: false
            referencedRelation: "nanny_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price_per_hour: number
          type: Database["public"]["Enums"]["service_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price_per_hour: number
          type: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price_per_hour?: number
          type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          status: Database["public"]["Enums"]["verification_status"] | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      working_hours: {
        Row: {
          created_at: string
          end_time: string
          id: string
          nanny_id: string
          start_time: string
          updated_at: string
          work_date: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          nanny_id: string
          start_time: string
          updated_at?: string
          work_date: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          nanny_id?: string
          start_time?: string
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_nanny_id_fkey"
            columns: ["nanny_id"]
            isOneToOne: false
            referencedRelation: "nanny_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_nanny_availability: {
        Args: {
          p_nanny_id: string
          p_start_time: string
          p_end_time: string
        }
        Returns: boolean
      }
      check_verification_code: {
        Args: {
          p_email: string
          p_code: string
        }
        Returns: boolean
      }
      check_verification_code_access: {
        Args: {
          p_email: string
        }
        Returns: boolean
      }
      create_nanny_with_user: {
        Args: {
          p_email: string
          p_first_name: string
          p_last_name: string
          p_phone: string
          p_birth_date: string
          p_position: string
          p_age_group: string
          p_camera_phone: string
          p_camera_number: string
          p_address: string
          p_relative_phone: string
          p_experience_years: number
          p_education: string
          p_hourly_rate: number
          p_photo_url: string
        }
        Returns: string
      }
      current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          role: string
        }[]
      }
      get_user_roles_by_id: {
        Args: {
          user_id_param: string
        }
        Returns: {
          role: string
        }[]
      }
    }
    Enums: {
      appointment_status: "pending" | "confirmed" | "cancelled" | "completed"
      document_type:
        | "criminal_record"
        | "image_usage_consent"
        | "medical_book"
        | "personal_data_consent"
      parent_status: "default" | "star" | "diamond"
      schedule_event_type: "sick_leave" | "vacation" | "busy" | "break"
      service_type: "one_child" | "two_children" | "additional"
      training_stage: "stage_1" | "stage_2" | "stage_3" | "stage_4" | "stage_5"
      user_role: "nanny" | "owner" | "admin" | "parent"
      verification_status: "pending" | "verified" | "expired" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
