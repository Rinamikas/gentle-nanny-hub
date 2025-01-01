import type { Database } from './database';
import type { ProfileRow } from './profile-types';

export type NannyProfile = Database['public']['Tables']['nanny_profiles']['Row'] & {
  profiles?: ProfileRow;
  nanny_training?: Database['public']['Tables']['nanny_training']['Row'];
};