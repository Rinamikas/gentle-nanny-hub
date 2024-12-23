import type { Tables } from '@/integrations/supabase/types';
import type { UserRole } from '@/integrations/supabase/types/enums';

export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  main_phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  user_roles?: {
    id: string;
    role: UserRole;
    created_at: string;
  }[];
}