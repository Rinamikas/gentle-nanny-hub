import type { Database } from './database';
import type { ProfileRow } from './profile-types';

export type ParentProfile = Database['public']['Tables']['parent_profiles']['Row'] & {
  profiles?: ProfileRow;
  children?: Database['public']['Tables']['children']['Row'][];
};