import { UserRole } from './enums';

export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  main_phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  user_roles: UserRole[];
}

export interface UserRoleType {
  role: UserRole;
}