import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { FormValues } from "../types/form";

export const useFamilyMutation = (familyId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: FormValues) => {
      console.log("useFamilyMutation: начало мутации с данными:", values);

      try {
        if (familyId) {
          console.log("useFamilyMutation: обновление существующей семьи");
          const { data, error } = await supabase.rpc('create_parent_with_user', {
            p_email: values.email,
            p_first_name: values.first_name,
            p_last_name: values.last_name,
            p_main_phone: values.main_phone,
            p_emergency_phone: values.emergency_phone,
            p_address: values.address,
            p_special_requirements: values.special_requirements,
            p_notes: values.notes,
            p_status: values.status
          });

          if (error) throw error;
          return data;
        } else {
          console.log("useFamilyMutation: создание новой семьи");
          
          // Сначала создаем пользователя через edge function
          console.log("useFamilyMutation: создание пользователя через edge function");
          const { data: authData, error: authError } = await supabase.functions.invoke(
            'create-auth-user',
            {
              body: JSON.stringify({ 
                email: values.email,
                code: Math.random().toString(36).slice(-8),
                shouldSignIn: false,
                userData: {
                  first_name: values.first_name,
                  last_name: values.last_name
                }
              })
            }
          );

          if (authError) {
            console.error("useFamilyMutation: ошибка создания пользователя:", authError);
            throw authError;
          }

          if (!authData?.id) {
            console.error("useFamilyMutation: не получен ID пользователя");
            throw new Error("Не удалось получить ID пользователя");
          }

          console.log("useFamilyMutation: пользователь создан с ID:", authData.id);
          
          // Небольшая задержка чтобы убедиться что пользователь создан
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log("useFamilyMutation: создаем профиль родителя");
          
          // Теперь создаем профиль родителя
          const { data, error } = await supabase.rpc('create_parent_with_user', {
            p_email: values.email,
            p_first_name: values.first_name,
            p_last_name: values.last_name,
            p_main_phone: values.main_phone,
            p_emergency_phone: values.emergency_phone,
            p_address: values.address,
            p_special_requirements: values.special_requirements,
            p_notes: values.notes,
            p_status: values.status
          });

          if (error) {
            console.error("useFamilyMutation: ошибка создания профиля родителя:", error);
            throw error;
          }

          console.log("useFamilyMutation: профиль родителя создан успешно");
          return data;
        }
      } catch (error) {
        console.error("useFamilyMutation: ошибка:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: familyId ? "Семья обновлена" : "Семья создана",
        description: familyId ? "Данные семьи успешно обновлены" : "Новая семья успешно создана",
      });
      queryClient.invalidateQueries({ queryKey: ['families'] });
      if (familyId) {
        queryClient.invalidateQueries({ queryKey: ['family', familyId] });
      }
    },
    onError: (error: Error) => {
      console.error("useFamilyMutation: ошибка в обработчике:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось сохранить данные семьи",
      });
    }
  });
};