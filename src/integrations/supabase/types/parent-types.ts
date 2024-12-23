import { Database } from './database';
import { ProfileRow } from './profile-types';

export type ParentProfileBase = Database['public']['Tables']['parent_profiles']['Row'];

export interface ParentProfile extends ParentProfileBase {
  profiles?: ProfileRow & { email?: string };
  children?: Database['public']['Tables']['children']['Row'][];
}