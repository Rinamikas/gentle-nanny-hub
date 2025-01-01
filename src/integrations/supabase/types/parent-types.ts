import { Database } from './database';
import { ProfileRow } from './profile-types';

export type ParentProfileBase = Database['public']['Tables']['parent_profiles']['Row'];

export interface ParentProfile extends ParentProfileBase {
  profiles?: ProfileRow;
  children?: ChildRow[];
  deleted_at?: string | null;
  is_deleted?: boolean | null;
  emergency_phone?: string | null;
}

export type ChildRow = Database['public']['Tables']['children']['Row'];