export interface ProfileRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdate {
  id?: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileTables {
  profiles: {
    Row: ProfileRow;
    Insert: ProfileInsert;
    Update: ProfileUpdate;
  }
  user_roles: {
    Row: {
      created_at: string;
      id: string;
      role: string;
      user_id: string | null;
    }
    Insert: {
      created_at?: string;
      id?: string;
      role: string;
      user_id?: string | null;
    }
    Update: {
      created_at?: string;
      id?: string;
      role?: string;
      user_id?: string | null;
    }
  }
}