import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormValues } from "../types/form";
import { useToast } from "@/hooks/use-toast";
import { checkUserExists, createNannyProfile, createNannyDocuments, createNannyTraining } from "../api/nannyApi";
import { supabase } from "@/integrations/supabase/client";

// Вспомогательная функция для задержки
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Функция для повторных попыток
const retryOperation = async (operation: () => Promise<boolean>, maxRetries = 5, delayMs = 2000): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    const result = await operation();
    if (result) return true;
    console.log(`Попытка ${i + 1} не удалась, ждем ${delayMs}мс...`);
    await delay(delayMs);
  }
  return false;
};

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

        if (userError || !userData?.id) {
          console.error("Error creating user:", userError);
          throw new Error(userError?.message || "Failed to create user");
        }

        const userId = userData.id;
        console.log("User created/found successfully:", userData);

        // Ждем репликацию данных
        console.log("Waiting for data replication...");
        await delay(5000);
        
        // Проверяем существование пользователя с повторными попытками
        const userExists = await retryOperation(
          async () => checkUserExists(userId),
          5,
          2000
        );

        if (!userExists) {
          throw new Error("User was not found in auth.users after multiple retries");
        }

        // Создаем профиль няни
        console.log("Creating nanny profile...");
        const nannyId = await createNannyProfile(values);
        
        // Создаем документы
        if (nannyId) {
          await createNannyDocuments(nannyId, values);
          await createNannyTraining(nannyId, values.training_stage);
        }

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