export interface UserRole {
  role: string;
}

export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  user_roles: UserRole[] | null;
}