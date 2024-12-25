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
    console.log(`Попытка ${i + 1} из ${maxAttempts} проверки существования пользователя`);
    
    const { data: userId, error } = await supabase
      .rpc('get_user_id_by_email', { email_param: email.toLowerCase() });

    if (error) {
      console.error("Ошибка при проверке существования пользователя:", error);
      continue;
    }

    if (userId) {
      console.log("Пользователь найден:", userId);
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
      console.log("Начинаем мутацию няни со значениями:", values);

      try {
        // Создаем пользователя через edge function
        console.log("Создаем пользователя через edge function...");
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
          console.error("Ошибка создания пользователя:", userError);
          throw new Error(userError?.message || "Не удалось создать пользователя");
        }

        console.log("Пользователь успешно создан:", userData);

        // Ждем пока пользователь появится в базе
        console.log("Ждем пока пользователь появится в базе...");
        const userId = await waitForUser(values.email);

        if (!userId) {
          throw new Error("Таймаут ожидания создания пользователя. Пожалуйста, попробуйте снова.");
        }

        // Создаем профиль няни
        console.log("Создаем профиль няни...");
        const nannyId = await createNannyProfile(values);
        
        // Создаем документы
        if (nannyId) {
          await createNannyDocuments(nannyId, values);
          await createNannyTraining(nannyId, values.training_stage);
        }

        return nannyId;
      } catch (error: any) {
        console.error("Ошибка в мутации:", {
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
      console.error("Ошибка сохранения няни:", {
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