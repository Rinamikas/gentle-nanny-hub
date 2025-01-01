import { Json } from "./json";

export interface NannyTables {
  nanny_profiles: {
    Row: {
      certifications: string[] | null;
      created_at: string;
      education: string | null;
      experience_years: number | null;
      hourly_rate: number | null;
      id: string;
      specializations: string[] | null;
      updated_at: string;
      user_id: string | null;
      birth_date: string | null;
      photo_url: string | null;
      position: string | null;
      age_group: string | null;
      camera_phone: string | null;
      camera_number: string | null;
      address: string | null;
      emergency_phone: string | null;
      deleted_at: string | null;
      profiles: {
        first_name: string | null;
        last_name: string | null;
        main_phone: string | null;
      } | null;
    };
    Insert: {
      certifications?: string[] | null;
      created_at?: string;
      education?: string | null;
      experience_years?: number | null;
      hourly_rate?: number | null;
      id?: string;
      specializations?: string[] | null;
      updated_at?: string;
      user_id?: string | null;
      birth_date?: string | null;
      photo_url?: string | null;
      position?: string | null;
      age_group?: string | null;
      camera_phone?: string | null;
      camera_number?: string | null;
      address?: string | null;
      emergency_phone?: string | null;
      deleted_at?: string | null;
    };
    Update: {
      certifications?: string[] | null;
      created_at?: string;
      education?: string | null;
      experience_years?: number | null;
      hourly_rate?: number | null;
      id?: string;
      specializations?: string[] | null;
      updated_at?: string;
      user_id?: string | null;
      birth_date?: string | null;
      photo_url?: string | null;
      position?: string | null;
      age_group?: string | null;
      camera_phone?: string | null;
      camera_number?: string | null;
      address?: string | null;
      emergency_phone?: string | null;
      deleted_at?: string | null;
    };
  };
}

export type NannyProfile = NannyTables["nanny_profiles"]["Row"];