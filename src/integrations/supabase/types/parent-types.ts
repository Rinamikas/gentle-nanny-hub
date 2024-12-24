import type { Database } from './database-types';
import type { ProfileRow } from './profile-types';

type ParentRow = Database['public']['Tables']['parent_profiles']['Row'];

export interface ParentProfile extends ParentRow {
  profiles?: ProfileRow;
  children?: {
    id: string;
    first_name: string;
    gender: string;
    birth_date: string;
    medical_conditions: string | null;
    notes: string | null;
  }[];
}