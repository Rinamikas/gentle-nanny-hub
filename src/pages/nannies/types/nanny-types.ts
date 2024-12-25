import type { Database } from '@/integrations/supabase/types';
import type { ProfileRow } from '@/integrations/supabase/types/profile-types';

type NannyRow = Database['public']['Tables']['nanny_profiles']['Row'];

export interface NannyProfile extends NannyRow {
  profiles?: ProfileRow & { 
    email?: string;
    phone?: string;
  };
  nanny_training?: {
    stage: Database['public']['Enums']['training_stage'];
  };
  nanny_documents?: {
    type: Database['public']['Enums']['document_type'];
    file_url: string;
  }[];
  relative_phone?: string;
}

export type NannyWithDetails = NannyProfile & {
  profiles: (ProfileRow & {
    email?: string;
    phone?: string;
  });
  nanny_training?: {
    stage: Database['public']['Enums']['training_stage'];
  };
  relative_phone: string;
};