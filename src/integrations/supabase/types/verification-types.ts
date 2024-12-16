export interface VerificationTables {
  verification_codes: {
    Row: {
      id: string
      email: string
      code: string
      status: string | null
      expires_at: string
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      email: string
      code: string
      status?: string | null
      expires_at: string
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      email?: string
      code?: string
      status?: string | null
      expires_at?: string
      created_at?: string
      updated_at?: string
    }
  }
}