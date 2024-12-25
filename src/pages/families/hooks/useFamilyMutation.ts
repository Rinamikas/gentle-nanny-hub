import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { FormValues } from "../types/form";

export const useFamilyMutation = (familyId?: string) => {
  return useMutation({
    mutationFn: async (values: FormValues) => {
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

          if (error) {
            console.error("useFamilyMutation: ошибка обновления:", error);
            throw error;
          }

          return data;
        } else {
          console.log("useFamilyMutation: создание новой семьи");
          
          console.log("useFamilyMutation: создание пользователя через edge function");
          const { data: authData, error: authError } = await supabase.functions.invoke(
            'create-auth-user',
            {
              body: JSON.stringify({ 
                email: values.email,
                code: '123456', // Временный код для создания пользователя
                shouldSignIn: false,
                userData: {
                  first_name: values.first_name,
                  last_name: values.last_name
                }
              })
            }
          );

          if (authError || !authData?.id) {
            console.error("useFamilyMutation: ошибка создания пользователя:", authError);
            throw new Error("Не удалось создать пользователя");
          }

          console.log("useFamilyMutation: пользователь создан с ID:", authData.id);
          
          // Теперь создаем профиль родителя
          console.log("useFamilyMutation: создаем профиль родителя");
          
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
            console.error("useFamilyMutation: ошибка создания:", error);
            throw error;
          }

          return data;
        }
      } catch (error) {
        console.error("useFamilyMutation: ошибка в обработчике:", error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error("useFamilyMutation: ошибка в обработчике:", error);
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось сохранить данные"
      });
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: `Семья успешно ${familyId ? "обновлена" : "создана"}`
      });
    }
  });
};