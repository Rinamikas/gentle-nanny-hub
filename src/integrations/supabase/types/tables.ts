import { ProfileTables } from './profile-types';
import { NannyTables } from './nanny-types';
import { VerificationTables } from './verification-types';

export interface Tables extends 
  ProfileTables,
  NannyTables,
  VerificationTables {
    children: {
      Row: {
        id: string;
        parent_profile_id: string | null;
        first_name: string;
        gender: string;
        birth_date: string;
        medical_conditions: string | null;
        notes: string | null;
        notify_before_birthday: number | null;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        parent_profile_id?: string | null;
        first_name: string;
        gender: string;
        birth_date: string;
        medical_conditions?: string | null;
        notes?: string | null;
        notify_before_birthday?: number | null;
      };
      Update: {
        id?: string;
        parent_profile_id?: string | null;
        first_name?: string;
        gender?: string;
        birth_date?: string;
        medical_conditions?: string | null;
        notes?: string | null;
        notify_before_birthday?: number | null;
      };
    };
    parent_profiles: {
      Row: {
        id: string;
        user_id: string | null;
        children_count: number | null;
        address: string | null;
        special_requirements: string | null;
        created_at: string;
        updated_at: string;
        status: string | null;
        additional_phone: string | null;
        notes: string | null;
      };
      Insert: {
        id?: string;
        user_id?: string | null;
        children_count?: number | null;
        address?: string | null;
        special_requirements?: string | null;
        status?: string | null;
        additional_phone?: string | null;
        notes?: string | null;
      };
      Update: {
        id?: string;
        user_id?: string | null;
        children_count?: number | null;
        address?: string | null;
        special_requirements?: string | null;
        status?: string | null;
        additional_phone?: string | null;
        notes?: string | null;
      };
    };
}