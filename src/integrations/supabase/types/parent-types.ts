import { Database } from './database';
import { ProfileRow } from './profile-types';

export type ParentProfileBase = Database['public']['Tables']['parent_profiles']['Row'];
export type ChildRow = Database['public']['Tables']['children']['Row'];

export interface ParentProfile extends ParentProfileBase {
  profiles?: Partial<ProfileRow>;
  children?: ChildRow[];
}