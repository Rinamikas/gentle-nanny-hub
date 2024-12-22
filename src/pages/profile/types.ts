import type { Tables } from '@/integrations/supabase/types';
import type { UserRole } from '@/integrations/supabase/types/enums';

export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  user_roles?: {
    created_at: string;
    id: string;
    role: UserRole;
    user_id: string | null;
  }[];
  nanny_profiles?: Tables<'nanny_profiles'>[] | null;
  parent_profiles?: Tables<'parent_profiles'>[] | null;
}