import { Json } from './json';

export interface ParentTables {
  parent_profiles: {
    Row: {
      address: string | null
      children_count: number | null
      created_at: string
      id: string
      special_requirements: string | null
      updated_at: string
      user_id: string | null
    }
    Insert: {
      address?: string | null
      children_count?: number | null
      created_at?: string
      id?: string
      special_requirements?: string | null
      updated_at?: string
      user_id?: string | null
    }
    Update: {
      address?: string | null
      children_count?: number | null
      created_at?: string
      id?: string
      special_requirements?: string | null
      updated_at?: string
      user_id?: string | null
    }
  }
}