import { supabase } from "@/integrations/supabase/client";
import { FormValues } from "../types/form";
import { DOCUMENT_TYPE } from "../types/documents";
import { Database } from "@/integrations/supabase/types";

type TrainingStage = Database['public']['Enums']['training_stage'];

export const checkUserExists = async (email: string): Promise<boolean> => {
  console.log("Проверяем существование пользователя с email:", email);
  
  try {
    const { data, error } = await supabase.functions.invoke('check-user-exists', {
      body: { email }
    });

    if (error) {
      console.error("Ошибка при проверке пользователя:", error);
      return false;
    }

    return data?.exists || false;
  } catch (error) {
    console.error("Ошибка при вызове функции проверки:", error);
    return false;
  }
};

export const createNannyProfile = async (values: FormValues): Promise<string> => {
  console.log("Creating nanny profile...");
  const { data: nannyData, error: createError } = await supabase
    .rpc('create_nanny_with_user', {
      p_email: values.email,
      p_first_name: values.first_name,
      p_last_name: values.last_name,
      p_phone: values.phone,
      p_birth_date: values.birth_date,
      p_position: values.position,
      p_age_group: values.age_group,
      p_camera_phone: values.camera_phone,
      p_camera_number: values.camera_number,
      p_address: values.address,
      p_relative_phone: values.relative_phone,
      p_experience_years: values.experience_years,
      p_education: values.education,
      p_hourly_rate: values.hourly_rate,
      p_photo_url: values.photo_url || ''
    });

  if (createError) {
    console.error("Error creating nanny:", createError);
    throw createError;
  }

  if (!nannyData) {
    console.error("No nanny data returned after creation");
    throw new Error("Не удалось создать профиль няни");
  }

  console.log("Nanny profile created successfully:", nannyData);
  return nannyData;
};

export const createNannyDocuments = async (nannyId: string, values: FormValues) => {
  const documents = [
    { type: DOCUMENT_TYPE.CRIMINAL_RECORD as const, file_url: values.criminal_record },
    { type: DOCUMENT_TYPE.IMAGE_USAGE_CONSENT as const, file_url: values.image_usage_consent },
    { type: DOCUMENT_TYPE.MEDICAL_BOOK as const, file_url: values.medical_book },
    { type: DOCUMENT_TYPE.PERSONAL_DATA_CONSENT as const, file_url: values.personal_data_consent },
  ].filter((doc) => doc.file_url);

  console.log("Creating documents:", documents);

  for (const doc of documents) {
    const { error: docError } = await supabase
      .from("nanny_documents")
      .insert({
        nanny_id: nannyId,
        type: doc.type,
        file_url: doc.file_url,
      });

    if (docError) {
      console.error(`Document creation error for ${doc.type}:`, docError);
      throw docError;
    }
  }

  console.log("Documents created successfully");
};

export const createNannyTraining = async (nannyId: string, stage?: string) => {
  if (!stage) return;

  console.log("Creating training stage:", stage);
  const { error: trainingError } = await supabase
    .from("nanny_training")
    .insert({
      nanny_id: nannyId,
      stage: stage as TrainingStage,
    });

  if (trainingError) {
    console.error("Training stage creation error:", trainingError);
    throw trainingError;
  }

  console.log("Training stage created successfully");
};