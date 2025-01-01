import type { Tables as SupabaseTables } from '../types';

export interface Database {
  public: {
    Tables: SupabaseTables
    Functions: {
      check_nanny_availability: {
        Args: { p_nanny_id: string; p_start_time: string; p_end_time: string }
        Returns: boolean
      }
      check_verification_code: {
        Args: { p_email: string; p_code: string }
        Returns: boolean
      }
      check_verification_code_access: {
        Args: { p_email: string }
        Returns: boolean
      }
      get_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: { user_id: string; role: string }[]
      }
    }
    Enums: {
      user_role: "nanny" | "owner" | "admin" | "parent"
      verification_status: "pending" | "verified" | "expired" | "failed"
      parent_status: "default" | "star" | "diamond"
    }
  }
}