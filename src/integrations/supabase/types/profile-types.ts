export interface ProfileRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  main_phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
  phone?: string;
}

export interface Profile extends ProfileRow {
  email?: string;
  user_roles?: {
    id: string;
    role: string;
    created_at: string;
  }[];
}

export interface ProfileTables {
  profiles: {
    Row: ProfileRow;
    Insert: Partial<ProfileRow>;
    Update: Partial<ProfileRow>;
  }
}