export interface ParentTables {
  parent_profiles: {
    Row: {
      id: string
      user_id: string | null
      children_count: number | null
      address: string | null
      special_requirements: string | null
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      user_id?: string | null
      children_count?: number | null
      address?: string | null
      special_requirements?: string | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      user_id?: string | null
      children_count?: number | null
      address?: string | null
      special_requirements?: string | null
      created_at?: string
      updated_at?: string
    }
  }
}