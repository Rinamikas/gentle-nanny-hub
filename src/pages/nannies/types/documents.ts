export type DocumentType = "criminal_record" | "image_usage_consent" | "medical_book" | "personal_data_consent";

export interface NannyDocument {
  id?: string;
  nanny_id?: string;
  type: DocumentType;
  file_url: string;
  created_at?: string;
  updated_at?: string;
}