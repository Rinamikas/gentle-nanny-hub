import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { ChildFormData } from "../types/children";

export const useChildrenData = (parentId: string) => {
  const queryClient = useQueryClient();

  const { data: children = [], isLoading } = useQuery({
    queryKey: ["children", parentId],
    queryFn: async () => {
      console.log("useChildrenData: загрузка списка детей для parentId =", parentId);
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_profile_id", parentId);

      if (error) {
        console.error("useChildrenData: ошибка при загрузке детей:", error);
        throw error;
      }

      console.log("useChildrenData: загружены дети:", data);
      return data || [];
    },
    enabled: !!parentId,
  });

  const mutation = useMutation({
    mutationFn: async ({ data, selectedChildId }: { data: ChildFormData; selectedChildId?: string }) => {
      console.log("useChildrenData: сохранение данных ребенка...", { data, selectedChildId });
      
      // Очищаем undefined значения
      const cleanedData = {
        ...data,
        medical_conditions: data.medical_conditions || null,
        notes: data.notes || null,
        parent_profile_id: parentId
      };
      
      console.log("useChildrenData: очищенные данные для сохранения:", cleanedData);

      const { data: child, error } = await supabase
        .from("children")
        .upsert({
          id: selectedChildId,
          ...cleanedData
        })
        .select()
        .single();

      if (error) {
        console.error("useChildrenData: ошибка при сохранении ребенка:", error);
        throw error;
      }

      return child;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      toast({
        title: "Успешно",
        description: "Данные ребенка сохранены",
      });
    },
    onError: (error) => {
      console.error("useChildrenData: ошибка при сохранении:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить данные ребенка",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (childId: string) => {
      console.log("useChildrenData: удаление ребенка...", childId);
      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", childId);

      if (error) {
        console.error("useChildrenData: ошибка при удалении ребенка:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      toast({
        title: "Успешно",
        description: "Ребенок удален",
      });
    },
    onError: (error) => {
      console.error("useChildrenData: ошибка при удалении:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить ребенка",
      });
    },
  });

  return {
    children,
    isLoading,
    mutation,
    deleteMutation
  };
};