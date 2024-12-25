import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormValues } from "../types/form";
import { useToast } from "@/hooks/use-toast";
import { createNannyProfile, createNannyDocuments, createNannyTraining } from "../api/nannyApi";
import { supabase } from "@/integrations/supabase/client";

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