import { Database } from '../types';

export type ParentProfile = Database['public']['Tables']['parent_profiles']['Row'] & {
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  children?: Array<{
    id: string;
    first_name: string;
    birth_date: string;
    gender: string;
    medical_conditions?: string | null;
    notes?: string | null;
    notify_before_birthday?: number;
  }>;
};