import { ProfileTables } from './profile-types';
import { NannyTables } from './nanny-types';
import { VerificationTables } from './verification-types';

export type { NannyProfile } from './nanny-types';
export type { ParentProfile } from './parent-types';

export interface Tables extends 
  ProfileTables,
  NannyTables,
  VerificationTables {
    parent_profiles: {
      Row: {
        id: string;
        user_id: string | null;
        children_count: number | null;
        address: string | null;
        special_requirements: string | null;
        created_at: string;
        updated_at: string;
        status: string | null;
        additional_phone: string | null;
        notes: string | null;
      };
      Insert: {
        id?: string;
        user_id?: string | null;
        children_count?: number | null;
        address?: string | null;
        special_requirements?: string | null;
        status?: string | null;
        additional_phone?: string | null;
        notes?: string | null;
      };
      Update: {
        id?: string;
        user_id?: string | null;
        children_count?: number | null;
        address?: string | null;
        special_requirements?: string | null;
        status?: string | null;
        additional_phone?: string | null;
        notes?: string | null;
      };
    };
}