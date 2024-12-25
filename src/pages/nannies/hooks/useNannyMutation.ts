import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormValues } from "../types/form";
import { useToast } from "@/hooks/use-toast";
import { checkUserExists, createNannyProfile, createNannyDocuments, createNannyTraining } from "../api/nannyApi";
import { supabase } from "@/integrations/supabase/client";

// Вспомогательная функция для задержки
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Функция для проверки существования пользователя
const waitForUser = async (email: string, maxAttempts = 10): Promise<string | null> => {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Attempt ${i + 1} of ${maxAttempts} to check user existence`);
    
    // Используем RPC функцию вместо админского API
    const { data: userId, error } = await supabase
      .rpc('get_user_id_by_email', { email_param: email.toLowerCase() });

    if (error) {
      console.error("Error checking user existence:", error);
      continue;
    }

    if (userId) {
      console.log("User found:", userId);
      return userId;
    }

    await delay(3000); // Ждем 3 секунды между попытками
  }

  return null;
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
            body: { 
              email: values.email,
              firstName: values.first_name,
              lastName: values.last_name,
              phone: values.phone
            }
          }
        );

        if (userError || !userData?.id) {
          console.error("Error creating user:", userError);
          throw new Error(userError?.message || "Failed to create user");
        }

        console.log("User created successfully:", userData);

        // Ждем пока пользователь появится в базе
        console.log("Waiting for user to be available in database...");
        const userId = await waitForUser(values.email);

        if (!userId) {
          throw new Error("Timeout waiting for user creation. Please try again.");
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
        description: error instanceof Error 
          ? error.message
          : "Не удалось сохранить данные. Пожалуйста, попробуйте еще раз.",
      });
    },
  });
};