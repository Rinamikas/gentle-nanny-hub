export const DOCUMENT_TYPE = {
  CRIMINAL_RECORD: 'criminal_record',
  IMAGE_USAGE_CONSENT: 'image_usage_consent',
  MEDICAL_BOOK: 'medical_book',
  PERSONAL_DATA_CONSENT: 'personal_data_consent',
} as const;

export type DocumentType = typeof DOCUMENT_TYPE[keyof typeof DOCUMENT_TYPE];

export interface NannyDocument {
  id?: string;
  nanny_id?: string;
  type: DocumentType;
  file_url: string;
  created_at?: string;
  updated_at?: string;
}