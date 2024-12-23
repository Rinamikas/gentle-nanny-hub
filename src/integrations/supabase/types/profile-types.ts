export interface ProfileRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  main_phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  main_phone?: string | null;
  photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdate {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  main_phone?: string | null;
  photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Profile extends ProfileRow {
  email?: string; // из auth.users
  user_roles?: {
    id: string;
    role: string;
    created_at: string;
  }[];
}

export interface ProfileTables {
  profiles: {
    Row: ProfileRow;
    Insert: ProfileInsert;
    Update: ProfileUpdate;
  }
}