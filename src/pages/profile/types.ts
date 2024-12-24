import type { Database } from '@/integrations/supabase/types';
import type { UserRole } from '@/integrations/supabase/types/enums';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface Profile extends ProfileRow {
  email?: string;
  phone?: string;
  user_roles?: {
    id: string;
    role: UserRole;
    created_at: string;
  }[];
}