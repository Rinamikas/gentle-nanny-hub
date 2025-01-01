import type { Database } from './database';
import type { ProfileRow } from './profile-types';

export type NannyProfileRow = Database['public']['Tables']['nanny_profiles']['Row'];

export interface NannyProfile extends NannyProfileRow {
  profiles?: ProfileRow;
  nanny_training?: Database['public']['Tables']['nanny_training']['Row'];
}