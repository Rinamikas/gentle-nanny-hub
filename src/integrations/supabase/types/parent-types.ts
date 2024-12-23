import { ProfileRow } from './profile-types';
import { ParentStatus } from './enums';

export interface ParentProfile {
  id: string;
  user_id: string | null;
  children_count: number | null;
  address: string | null;
  special_requirements: string | null;
  created_at: string;
  updated_at: string;
  status: ParentStatus | null;
  emergency_phone: string | null;
  additional_phone: string | null;
  notes: string | null;
  is_deleted: boolean | null;
  deleted_at: string | null;
  profiles?: ProfileRow & { email?: string };
  children?: {
    id: string;
    first_name: string;
    gender: string;
    birth_date: string;
    medical_conditions: string | null;
    notes: string | null;
  }[];
}

export interface ParentTables {
  parent_profiles: {
    Row: ParentProfile;
    Insert: Partial<ParentProfile>;
    Update: Partial<ParentProfile>;
  }
}