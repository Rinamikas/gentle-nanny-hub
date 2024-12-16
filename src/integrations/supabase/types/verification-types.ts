import { Json } from './json';

export interface VerificationTables {
  verification_codes: {
    Row: {
      code: string
      created_at: string
      email: string
      expires_at: string
      id: string
      status: string | null
      updated_at: string
    }
    Insert: {
      code: string
      created_at?: string
      email: string
      expires_at: string
      id?: string
      status?: string | null
      updated_at?: string
    }
    Update: {
      code?: string
      created_at?: string
      email?: string
      expires_at?: string
      id?: string
      status?: string | null
      updated_at?: string
    }
  }
}