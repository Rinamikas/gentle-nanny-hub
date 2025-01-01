import { Database } from './database';
import { ProfileRow } from './profile-types';

export interface NannyProfile extends Database['public']['Tables']['nanny_profiles']['Row'] {
  profiles?: ProfileRow;
  deleted_at?: string | null;
  is_deleted?: boolean | null;
  relative_phone?: string | null;
}

export interface NannyTables {
  nanny_profiles: {
    Row: NannyProfile;
    Insert: Omit<NannyProfile, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<NannyProfile>;
  };
}