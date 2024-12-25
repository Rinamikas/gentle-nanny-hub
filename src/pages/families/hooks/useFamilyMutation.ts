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
          
          // Сначала обновляем основной профиль
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              first_name: values.first_name,
              last_name: values.last_name,
              main_phone: values.main_phone,
              updated_at: new Date().toISOString()
            })
            .eq('id', familyData.user_id);

          if (profileError) {
            console.error("useFamilyMutation: ошибка обновления profiles:", profileError);
            throw profileError;
          }

          // Затем обновляем профиль родителя
          const { error: parentError } = await supabase
            .from('parent_profiles')
            .update({
              emergency_phone: values.emergency_phone,
              address: values.address,
              special_requirements: values.special_requirements,
              notes: values.notes,
              status: values.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', familyId);

          if (parentError) {
            console.error("useFamilyMutation: ошибка обновления parent_profiles:", parentError);
            throw parentError;
          }

          return familyId;
        } else {
          console.log("useFamilyMutation: создание новой семьи");
          
          // Для новой семьи используем RPC функцию
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