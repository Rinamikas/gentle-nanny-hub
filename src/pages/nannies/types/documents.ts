export enum DOCUMENT_TYPE {
  CRIMINAL_RECORD = "criminal_record",
  IMAGE_USAGE_CONSENT = "image_usage_consent",
  MEDICAL_BOOK = "medical_book",
  PERSONAL_DATA_CONSENT = "personal_data_consent",
}

export interface NannyDocument {
  id?: string;
  nanny_id?: string;
  type: DOCUMENT_TYPE;
  file_url: string;
  created_at?: string;
  updated_at?: string;
}
