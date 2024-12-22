import { Database } from '@/integrations/supabase/types';
import { ProfileRow } from '@/integrations/supabase/types/profile-types';

export type ParentProfileBase = Database['public']['Tables']['parent_profiles']['Row'];
export type ParentStatus = Database['public']['Enums']['parent_status'];

export interface ParentProfile extends ParentProfileBase {
  profiles?: ProfileRow;
  children?: Database['public']['Tables']['children']['Row'][];
}