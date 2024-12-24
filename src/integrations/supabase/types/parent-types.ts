import type { Database } from './database';
import type { ProfileRow } from './profile-types';

type ParentRow = Database['public']['Tables']['parent_profiles']['Row'];

export interface ParentProfile extends Omit<ParentRow, 'additional_phone'> {
  profiles?: ProfileRow & { 
    email?: string;
    phone?: string;
  };
  additional_phone?: string;
  children?: {
    id: string;
    first_name: string;
    gender: string;
    birth_date: string;
    medical_conditions: string | null;
    notes: string | null;
  }[];
}