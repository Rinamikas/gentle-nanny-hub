import { Json } from './json';
import type { Database } from './database';

export interface ParentTables {
  parent_profiles: {
    Row: {
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
    Insert: {
      id?: string;
      user_id?: string | null;
      children_count?: number | null;
      address?: string | null;
      special_requirements?: string | null;
      created_at?: string;
      updated_at?: string;
      status?: Database['public']['Enums']['parent_status'] | null;
      additional_phone?: string | null;
      notes?: string | null;
    }
    Update: {
      id?: string;
      user_id?: string | null;
      children_count?: number | null;
      address?: string | null;
      special_requirements?: string | null;
      created_at?: string;
      updated_at?: string;
      status?: Database['public']['Enums']['parent_status'] | null;
      additional_phone?: string | null;
      notes?: string | null;
    }
  }
}

export type ParentProfileBase = ParentTables['parent_profiles']['Row'];

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