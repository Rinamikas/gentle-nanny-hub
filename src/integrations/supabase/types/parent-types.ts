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
      status: 'default' | 'star' | 'diamond' | null
      additional_phone: string | null
      notes: string | null
    }
    Insert: {
      id?: string
      user_id?: string | null
      children_count?: number | null
      address?: string | null
      special_requirements?: string | null
      created_at?: string
      updated_at?: string
      status?: 'default' | 'star' | 'diamond' | null
      additional_phone?: string | null
      notes?: string | null
    }
    Update: {
      id?: string
      user_id?: string | null
      children_count?: number | null
      address?: string | null
      special_requirements?: string | null
      created_at?: string
      updated_at?: string
      status?: 'default' | 'star' | 'diamond' | null
      additional_phone?: string | null
      notes?: string | null
    }
  }
}

export type ParentProfile = ParentTables['parent_profiles']['Row'] & {
  profiles?: {
    first_name: string | null
    last_name: string | null
    phone: string | null
  } | null
  children?: Array<{
    id: string
    first_name: string
  }>
}