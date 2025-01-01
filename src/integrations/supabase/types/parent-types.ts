import type { Database } from './database';
import type { ProfileRow } from './profile-types';

type ParentProfileRow = Database['public']['Tables']['parent_profiles']['Row'];

export interface ParentProfile extends ParentProfileRow {
  profiles?: ProfileRow;
  children?: Database['public']['Tables']['children']['Row'][];
}