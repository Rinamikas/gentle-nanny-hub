import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FormValues } from "../types/form";
import { useToast } from "@/hooks/use-toast";
import { DOCUMENT_TYPE } from "../types/documents";

export const useNannyMutation = (onSuccess: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: FormValues) => {
      console.log("Starting nanny mutation with values:", values);

      try {
        // Создаем или обновляем няню через функцию
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

        // Создаем документы
        const documents = [
          {
            type: DOCUMENT_TYPE.CRIMINAL_RECORD,
            file_url: values.criminal_record,
          },
          {
            type: DOCUMENT_TYPE.IMAGE_USAGE_CONSENT,
            file_url: values.image_usage_consent,
          },
          { 
            type: DOCUMENT_TYPE.MEDICAL_BOOK, 
            file_url: values.medical_book 
          },
          {
            type: DOCUMENT_TYPE.PERSONAL_DATA_CONSENT,
            file_url: values.personal_data_consent,
          },
        ].filter((doc) => doc.file_url);

        for (const doc of documents) {
          const { error: docError } = await supabase
            .from("nanny_documents")
            .insert({
              nanny_id: nannyData,
              type: doc.type,
              file_url: doc.file_url,
            });

          if (docError) {
            console.error(`Document creation error for ${doc.type}:`, docError);
            throw docError;
          }
        }

        console.log("Documents created successfully");

        // Создаем этап обучения
        if (values.training_stage) {
          const { error: trainingError } = await supabase
            .from("nanny_training")
            .insert({
              nanny_id: nannyData,
              stage: values.training_stage,
            });

          if (trainingError) {
            console.error("Training stage creation error:", trainingError);
            throw trainingError;
          }

          console.log("Training stage created successfully");
        }

        return nannyData;
      } catch (error) {
        console.error("Error in mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nannies"] });
      toast({
        title: "Успешно",
        description: "Данные сохранены",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Error saving nanny:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : "Не удалось сохранить данные",
      });
    },
  });
};