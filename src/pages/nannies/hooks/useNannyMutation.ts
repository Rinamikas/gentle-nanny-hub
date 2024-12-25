import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormValues } from "../types/form";
import { useToast } from "@/hooks/use-toast";
import { checkUserExists, createNannyProfile, createNannyDocuments, createNannyTraining } from "../api/nannyApi";
import { supabase } from "@/integrations/supabase/client";

// Вспомогательная функция для задержки
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useNannyMutation = (onSuccess: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: FormValues) => {
      console.log("Starting nanny mutation with values:", values);

      try {
        // Создаем пользователя через edge function
        console.log("Creating user via edge function...");
        const { data: userData, error: userError } = await supabase.functions.invoke(
          'create-user',
          {
            body: { email: values.email }
          }
        );

        if (userError) {
          console.error("Error creating user:", userError);
          throw userError;
        }

        if (!userData?.id) {
          console.error("No user data returned");
          throw new Error("Failed to create user");
        }

        console.log("User created/found successfully:", userData);

        // Добавляем задержку в 5 секунд для репликации данных
        console.log("Waiting for data replication (5 seconds)...");
        await delay(5000);
        
        // Проверяем существование пользователя перед созданием профиля
        let retries = 3;
        let userExists = false;
        
        while (retries > 0 && !userExists) {
          userExists = await checkUserExists(values.email);
          if (userExists) {
            console.log("User found in auth.users");
            break;
          }
          console.log(`User not found, ${retries - 1} retries left`);
          await delay(1000);
          retries--;
        }

        if (!userExists) {
          throw new Error("User was not found in auth.users after multiple retries");
        }

        // Создаем профиль няни
        const nannyId = await createNannyProfile(values);
        
        // Создаем документы
        await createNannyDocuments(nannyId, values);
        
        // Создаем этап обучения
        await createNannyTraining(nannyId, values.training_stage);

        return nannyId;
      } catch (error: any) {
        console.error("Error in mutation:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
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
    onError: (error: any) => {
      console.error("Error saving nanny:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
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