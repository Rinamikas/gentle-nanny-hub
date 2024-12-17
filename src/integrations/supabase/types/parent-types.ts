import type { Database } from './database';

export interface ParentProfile extends Database['public']['Tables']['parent_profiles']['Row'] {
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
    Row: Database['public']['Tables']['parent_profiles']['Row'];
    Insert: Database['public']['Tables']['parent_profiles']['Insert'];
    Update: Database['public']['Tables']['parent_profiles']['Update'];
  }
}