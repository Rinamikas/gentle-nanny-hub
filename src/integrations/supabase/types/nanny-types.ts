import { Json } from './json';

export interface NannyTables {
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
  nanny_documents: {
    Row: {
      created_at: string
      file_url: string
      id: string
      nanny_id: string | null
      type: string
      updated_at: string
    }
    Insert: {
      created_at?: string
      file_url: string
      id?: string
      nanny_id?: string | null
      type: string
      updated_at?: string
    }
    Update: {
      created_at?: string
      file_url?: string
      id?: string
      nanny_id?: string | null
      type?: string
      updated_at?: string
    }
  }
  nanny_training: {
    Row: {
      completed_at: string
      created_at: string
      id: string
      nanny_id: string | null
      stage: string
      updated_at: string
    }
    Insert: {
      completed_at?: string
      created_at?: string
      id?: string
      nanny_id?: string | null
      stage: string
      updated_at?: string
    }
    Update: {
      completed_at?: string
      created_at?: string
      id?: string
      nanny_id?: string | null
      stage?: string
      updated_at?: string
    }
  }
}