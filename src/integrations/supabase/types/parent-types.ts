import type { Database } from './database';

// Define the base interface for parent profile data
export interface ParentProfileData {
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

// Extend the base interface for the full parent profile
export interface ParentProfile extends ParentProfileData {
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  } | null;
  children?: Array<{
    id: string;
    first_name: string;
  }>;
}

// Define the table interface
export interface ParentTables {
  parent_profiles: {
    Row: ParentProfileData;
    Insert: Omit<ParentProfileData, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<ParentProfileData, 'id'>>;
  }
}