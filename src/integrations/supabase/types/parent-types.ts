import type { Database } from './database';

export type ParentProfileBase = Database['public']['Tables']['parent_profiles']['Row'];

export interface ParentProfile extends ParentProfileBase {
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

export interface ParentTables {
  parent_profiles: {
    Row: ParentProfileBase;
    Insert: Database['public']['Tables']['parent_profiles']['Insert'];
    Update: Database['public']['Tables']['parent_profiles']['Update'];
  }
}