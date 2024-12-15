import { Json } from './json';
import { UserRole, VerificationStatus } from './enums';

export interface Tables {
  nanny_profiles: {
    Row: {
      certifications: string[] | null
      created_at: string
      education: string | null
      experience_years: number | null
      hourly_rate: number | null
      id: string
      specializations: string[] | null
      updated_at: string
      user_id: string | null
    }
    Insert: {
      certifications?: string[] | null
      created_at?: string
      education?: string | null
      experience_years?: number | null
      hourly_rate?: number | null
      id?: string
      specializations?: string[] | null
      updated_at?: string
      user_id?: string | null
    }
    Update: {
      certifications?: string[] | null
      created_at?: string
      education?: string | null
      experience_years?: number | null
      hourly_rate?: number | null
      id?: string
      specializations?: string[] | null
      updated_at?: string
      user_id?: string | null
    }
  }
  parent_profiles: {
    Row: {
      address: string | null
      children_count: number | null
      created_at: string
      id: string
      special_requirements: string | null
      updated_at: string
      user_id: string | null
    }
    Insert: {
      address?: string | null
      children_count?: number | null
      created_at?: string
      id?: string
      special_requirements?: string | null
      updated_at?: string
      user_id?: string | null
    }
    Update: {
      address?: string | null
      children_count?: number | null
      created_at?: string
      id?: string
      special_requirements?: string | null
      updated_at?: string
      user_id?: string | null
    }
  }
  profiles: {
    Row: {
      created_at: string
      email: string | null
      first_name: string | null
      id: string
      last_name: string | null
      phone: string | null
      updated_at: string
    }
    Insert: {
      created_at?: string
      email?: string | null
      first_name?: string | null
      id: string
      last_name?: string | null
      phone?: string | null
      updated_at?: string
    }
    Update: {
      created_at?: string
      email?: string | null
      first_name?: string | null
      id?: string
      last_name?: string | null
      phone?: string | null
      updated_at?: string
    }
  }
  user_roles: {
    Row: {
      created_at: string
      id: string
      role: UserRole
      user_id: string | null
    }
    Insert: {
      created_at?: string
      id?: string
      role: UserRole
      user_id?: string | null
    }
    Update: {
      created_at?: string
      id?: string
      role?: UserRole
      user_id?: string | null
    }
  }
  verification_codes: {
    Row: {
      code: string
      created_at: string
      email: string
      expires_at: string
      id: string
      status: VerificationStatus | null
      updated_at: string
    }
    Insert: {
      code: string
      created_at?: string
      email: string
      expires_at: string
      id?: string
      status?: VerificationStatus | null
      updated_at?: string
    }
    Update: {
      code?: string
      created_at?: string
      email?: string
      expires_at?: string
      id?: string
      status?: VerificationStatus | null
      updated_at?: string
    }
  }
}