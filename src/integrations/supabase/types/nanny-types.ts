import type { Database } from './database';
import type { ProfileRow } from './profile-types';

export type NannyProfileRow = Database['public']['Tables']['nanny_profiles']['Row'];
export type NannyProfileInsert = Database['public']['Tables']['nanny_profiles']['Insert'];
export type NannyProfileUpdate = Database['public']['Tables']['nanny_profiles']['Update'];

export interface NannyProfile extends NannyProfileRow {
  profiles?: ProfileRow;
  nanny_training?: Database['public']['Tables']['nanny_training']['Row'];
  deleted_at: string | null;
  relative_phone?: string;
}