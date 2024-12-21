import { ProfileRow } from './profile-types';
import { ChildRow } from './database-types';

export interface ParentProfileBase {
  id: string;
  user_id: string | null;
  children_count: number | null;
  address: string | null;
  special_requirements: string | null;
  created_at: string;
  updated_at: string;
  status: string | null;
  additional_phone: string | null;
  notes: string | null;
  is_deleted: boolean | null;
  deleted_at: string | null;
}

export interface ParentProfile extends ParentProfileBase {
  profiles?: Partial<ProfileRow>;
  children?: ChildRow[];
}