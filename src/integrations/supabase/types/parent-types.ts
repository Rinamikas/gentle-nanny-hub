import { Database } from './database';

export type ParentProfile = Database['public']['Tables']['parent_profiles']['Row'] & {
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};