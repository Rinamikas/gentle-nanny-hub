import { Database } from './database';
import { ProfileRow } from './profile-types';
import { Tables } from './tables';

export type ParentProfileBase = Database['public']['Tables']['parent_profiles']['Row'];
export type ChildRow = Tables['children']['Row'];

export interface ParentProfile extends ParentProfileBase {
  profiles?: ProfileRow;
  children?: ChildRow[];
}