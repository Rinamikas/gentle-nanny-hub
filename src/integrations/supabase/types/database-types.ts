import { Database } from './database';

export type ParentProfileBase = Database['public']['Tables']['parent_profiles']['Row'];
export type ChildRow = Database['public']['Tables']['children']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface ParentProfile extends ParentProfileBase {
  profiles?: Partial<ProfileRow>;
  children?: ChildRow[];
}

export interface Tables {
  parent_profiles: {
    Row: ParentProfileBase;
    Insert: {
      id?: string;
      user_id?: string | null;
      children_count?: number | null;
      address?: string | null;
      special_requirements?: string | null;
      status?: string | null;
      additional_phone?: string | null;
      notes?: string | null;
    };
    Update: {
      id?: string;
      user_id?: string | null;
      children_count?: number | null;
      address?: string | null;
      special_requirements?: string | null;
      status?: string | null;
      additional_phone?: string | null;
      notes?: string | null;
    };
  };
  children: {
    Row: ChildRow;
    Insert: {
      id?: string;
      parent_profile_id?: string | null;
      first_name: string;
      gender: string;
      birth_date: string;
      medical_conditions?: string | null;
      notes?: string | null;
      notify_before_birthday?: number | null;
    };
    Update: {
      id?: string;
      parent_profile_id?: string | null;
      first_name?: string;
      gender?: string;
      birth_date?: string;
      medical_conditions?: string | null;
      notes?: string | null;
      notify_before_birthday?: number | null;
    };
  };
}