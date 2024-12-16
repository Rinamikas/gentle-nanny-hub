import { Json } from './json';

export interface ProfileTables {
  profiles: {
    Row: {
      created_at: string
      email: string | null
      first_name: string | null
      id: string
      last_name: string | null
      phone: string | null
      updated_at: string
      photo_url: string | null
    }
    Insert: {
      created_at?: string
      email?: string | null
      first_name?: string | null
      id: string
      last_name?: string | null
      phone?: string | null
      updated_at?: string
      photo_url?: string | null
    }
    Update: {
      created_at?: string
      email?: string | null
      first_name?: string | null
      id?: string
      last_name?: string | null
      phone?: string | null
      updated_at?: string
      photo_url?: string | null
    }
  }
  user_roles: {
    Row: {
      created_at: string
      id: string
      role: string
      user_id: string | null
    }
    Insert: {
      created_at?: string
      id?: string
      role: string
      user_id?: string | null
    }
    Update: {
      created_at?: string
      id?: string
      role?: string
      user_id?: string | null
    }
  }
}