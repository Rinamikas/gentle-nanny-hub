import type { Database } from './database';

type ParentProfileRow = Database['public']['Tables']['parent_profiles']['Row'];
type ParentProfileInsert = Database['public']['Tables']['parent_profiles']['Insert'];
type ParentProfileUpdate = Database['public']['Tables']['parent_profiles']['Update'];

export interface ParentTables {
  parent_profiles: {
    Row: ParentProfileRow;
    Insert: ParentProfileInsert;
    Update: ParentProfileUpdate;
  }
}

export interface ParentProfile extends ParentProfileRow {
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