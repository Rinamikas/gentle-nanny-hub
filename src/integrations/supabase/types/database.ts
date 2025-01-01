import type { Database as SupabaseDatabase } from '../types';

export type Database = SupabaseDatabase;
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];