export interface ChildFormData {
  first_name: string;
  gender: string;
  birth_date: string;
  medical_conditions?: string | null;
  notes?: string | null;
  notify_before_birthday: number;
}

export interface Child {
  id: string;
  parent_profile_id: string | null;
  first_name: string;
  gender: string;
  birth_date: string;
  medical_conditions: string | null;
  notes: string | null;
  notify_before_birthday: number | null;
}