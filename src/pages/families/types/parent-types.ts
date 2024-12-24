import type { Database } from '@/integrations/supabase/types';
import type { ProfileRow } from '@/integrations/supabase/types/profile-types';
import type { ParentStatus } from '@/integrations/supabase/types/enums';

type ParentRow = Database['public']['Tables']['parent_profiles']['Row'];

export interface ParentProfile extends ParentRow {
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