import { Json } from './json';
import { UserRole, VerificationStatus, DocumentType, TrainingStage } from './enums';

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
      birth_date: string | null
      phone: string | null
      email: string | null
      photo_url: string | null
      position: string | null
      age_group: string | null
      camera_phone: string | null
      camera_number: string | null
      address: string | null
      relative_phone: string | null
      is_deleted: boolean | null
      deleted_at: string | null
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
      birth_date?: string | null
      phone?: string | null
      email?: string | null
      photo_url?: string | null
      position?: string | null
      age_group?: string | null
      camera_phone?: string | null
      camera_number?: string | null
      address?: string | null
      relative_phone?: string | null
      is_deleted?: boolean | null
      deleted_at?: string | null
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
      birth_date?: string | null
      phone?: string | null
      email?: string | null
      photo_url?: string | null
      position?: string | null
      age_group?: string | null
      camera_phone?: string | null
      camera_number?: string | null
      address?: string | null
      relative_phone?: string | null
      is_deleted?: boolean | null
      deleted_at?: string | null
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
      photo_url: string | null
    }
    Insert: {
      created_at?: string
      email?: string | null
      first_name?: string | null
      id: string
      last_name?: string | null
      phone?: string | null
      updated_at?: string
      photo_url?: string | null
    }
    Update: {
      created_at?: string
      email?: string | null
      first_name?: string | null
      id?: string
      last_name?: string | null
      phone?: string | null
      updated_at?: string
      photo_url?: string | null
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
  nanny_documents: {
    Row: {
      created_at: string
      file_url: string
      id: string
      nanny_id: string | null
      type: DocumentType
      updated_at: string
    }
    Insert: {
      created_at?: string
      file_url: string
      id?: string
      nanny_id?: string | null
      type: DocumentType
      updated_at?: string
    }
    Update: {
      created_at?: string
      file_url?: string
      id?: string
      nanny_id?: string | null
      type?: DocumentType
      updated_at?: string
    }
  }
  nanny_training: {
    Row: {
      completed_at: string
      created_at: string
      id: string
      nanny_id: string | null
      stage: TrainingStage
      updated_at: string
    }
    Insert: {
      completed_at?: string
      created_at?: string
      id?: string
      nanny_id?: string | null
      stage: TrainingStage
      updated_at?: string
    }
    Update: {
      completed_at?: string
      created_at?: string
      id?: string
      nanny_id?: string | null
      stage?: TrainingStage
      updated_at?: string
    }
  }
}