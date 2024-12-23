import { ProfileRow } from './profile-types';

export interface NannyProfile {
  id: string;
  user_id: string | null;
  experience_years: number | null;
  education: string | null;
  specializations: string[] | null;
  certifications: string[] | null;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
  birth_date: string | null;
  photo_url: string | null;
  position: string | null;
  age_group: string | null;
  camera_phone: string | null;
  camera_number: string | null;
  address: string | null;
  emergency_phone: string | null;
  relative_phone: string | null;
  profiles?: ProfileRow & { email?: string };
}

export interface NannyTables {
  nanny_profiles: {
    Row: NannyProfile;
    Insert: Partial<NannyProfile>;
    Update: Partial<NannyProfile>;
  }
}