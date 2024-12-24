import type { Database } from '@/integrations/supabase/types';
import type { ProfileRow } from '@/integrations/supabase/types/profile-types';

type NannyRow = Database['public']['Tables']['nanny_profiles']['Row'];

export interface NannyProfile extends NannyRow {
  profiles?: ProfileRow & { 
    email?: string;
    phone?: string;
  };
  nanny_training?: {
    stage: string;
  };
  nanny_documents?: {
    type: string;
    file_url: string;
  }[];
  relative_phone?: string;
}