import type { Database } from './database';
import type { ChildRow, ProfileRow } from './database-types';

export type ParentProfileBase = Database['public']['Tables']['parent_profiles']['Row'];

export interface ParentProfile extends ParentProfileBase {
  profiles?: Partial<ProfileRow>;
  children?: ChildRow[];
}