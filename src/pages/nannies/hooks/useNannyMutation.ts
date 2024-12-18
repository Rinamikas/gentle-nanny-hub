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

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }

      if (!session?.user?.id) {
        console.error("No user session found");
        throw new Error("Пользователь не авторизован");
      }

      console.log("User session found:", session.user.id);

      // Проверяем существование профиля
      const { data: existingNanny, error: checkError } = await supabase
        .from("nanny_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      console.log("Existing nanny check result:", {
        existingNanny,
        checkError,
      });

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking existing nanny:", checkError);
        throw checkError;
      }

      if (existingNanny) {
        console.error("Nanny profile already exists");
        throw new Error("Профиль няни уже существует для этого пользователя");
      }

      // Создаем или обновляем профиль
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: session.user.id,
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        email: values.email,
      });

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      console.log("Profile updated successfully");

      // Создаем профиль няни
      const { data: nannyData, error: nannyError } = await supabase
        .from("nanny_profiles")
        .insert({
          user_id: session.user.id,
          birth_date: values.birth_date,
          position: values.position,
          age_group: values.age_group,
          camera_phone: values.camera_phone,
          camera_number: values.camera_number,
          address: values.address,
          relative_phone: values.relative_phone,
          experience_years: values.experience_years,
          education: values.education,
          hourly_rate: values.hourly_rate,
          photo_url: values.photo_url,
        })
        .select()
        .single();

      if (nannyError) {
        console.error("Nanny profile creation error:", nannyError);
        throw nannyError;
      }

      if (!nannyData) {
        console.error("No nanny data returned after insert");
        throw new Error("Не удалось создать профиль няни");
      }

      console.log("Nanny profile created successfully:", nannyData);

      // Создаем документы
      const documents: Array<{ type: DOCUMENT_TYPE; file_url: string }> = [
        {
          type: DOCUMENT_TYPE.CRIMINAL_RECORD,
          file_url: values.criminal_record,
        },
        {
          type: DOCUMENT_TYPE.IMAGE_USAGE_CONSENT,
          file_url: values.image_usage_consent,
        },
        { type: DOCUMENT_TYPE.MEDICAL_BOOK, file_url: values.medical_book },
        {
          type: DOCUMENT_TYPE.PERSONAL_DATA_CONSENT,
          file_url: values.personal_data_consent,
        },
      ].filter((doc) => doc.file_url);

      for (const doc of documents) {
        const { error: docError } = await supabase
          .from("nanny_documents")
          .insert({
            nanny_id: nannyData.id,
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
            nanny_id: nannyData.id,
            stage: values.training_stage,
          });

        if (trainingError) {
          console.error("Training stage creation error:", trainingError);
          throw trainingError;
        }

        console.log("Training stage created successfully");
      }

      return nannyData;
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
