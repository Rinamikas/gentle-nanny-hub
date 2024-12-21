import type { Database } from '@/integrations/supabase/types';

// Базовый тип из Supabase
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type UserRoleRow = Database['public']['Tables']['user_roles']['Row'];

// Расширяем тип для нашего компонента
export interface User extends ProfileRow {
  user_roles?: Pick<UserRoleRow, 'role'>[];
}

// Используем enum из базы данных для ролей
export type UserRole = Database['public']['Enums']['user_role'];