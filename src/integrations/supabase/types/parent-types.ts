import type { Database } from './database';

export interface ParentProfile {
  id: string;
  user_id: string | null;
  children_count: number | null;
  address: string | null;
  special_requirements: string | null;
  created_at: string;
  updated_at: string;
  status: Database['public']['Enums']['parent_status'] | null;
  additional_phone: string | null;
  notes: string | null;
}

export interface ParentTables {
  parent_profiles: {
    Row: ParentProfile;
    Insert: Omit<ParentProfile, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<ParentProfile>;
  };
}