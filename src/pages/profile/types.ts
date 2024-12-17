import type { NannyProfile, ParentProfile, UserRole } from "@/integrations/supabase/types";

export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  user_roles: UserRole[];
  nanny_profiles: NannyProfile[] | null;
  parent_profiles: ParentProfile[] | null;
}