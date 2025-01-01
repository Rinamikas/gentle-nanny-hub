import type { Database } from './database';
import type { ProfileRow } from './profile-types';

export type ParentProfileRow = Database['public']['Tables']['parent_profiles']['Row'];
export type ParentProfileInsert = Database['public']['Tables']['parent_profiles']['Insert'];
export type ParentProfileUpdate = Database['public']['Tables']['parent_profiles']['Update'];

export interface ParentProfile extends ParentProfileRow {
  profiles?: ProfileRow;
  children?: Database['public']['Tables']['children']['Row'][];
  additional_phone?: string;
}