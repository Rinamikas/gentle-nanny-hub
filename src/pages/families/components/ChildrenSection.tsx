import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ChildForm from "./ChildForm";

interface ChildFormData {
  first_name: string;
  gender: string;
  birth_date: string;
  medical_conditions?: string;
  notes?: string;
  notify_before_birthday: number;
}

interface ChildrenSectionProps {
  parentId: string;
}

const ChildrenSection = ({ parentId }: ChildrenSectionProps) => {
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  console.log("ChildrenSection: начало рендера с parentId =", parentId);
  console.log("ChildrenSection: текущее состояние формы:", { isDialogOpen, selectedChild });

  const { data: children = [], isLoading } = useQuery({
    queryKey: ["children", parentId],
    queryFn: async () => {
      console.log("ChildrenSection: загрузка списка детей для parentId =", parentId);
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_profile_id", parentId);

      if (error) {
        console.error("ChildrenSection: ошибка при загрузке детей:", error);
        throw error;
      }

      console.log("ChildrenSection: загружены дети:", data);
      return data || [];
    },
    enabled: !!parentId,
  });

  const mutation = useMutation({
    mutationFn: async (data: ChildFormData) => {
      console.log("ChildrenSection: сохранение данных ребенка...", data);
      
      // Очищаем undefined значения
      const cleanedData = {
        ...data,
        medical_conditions: data.medical_conditions?.value !== "undefined" ? data.medical_conditions : null,
        notes: data.notes?.value !== "undefined" ? data.notes : null,
        parent_profile_id: parentId // Добавляем parent_profile_id
      };
      
      console.log("ChildrenSection: очищенные данные для сохранения:", cleanedData);

      const { data: child, error } = await supabase
        .from("children")
        .upsert({
          id: selectedChild?.id,
          ...cleanedData
        })
        .select()
        .single();

      if (error) {
        console.error("ChildrenSection: ошибка при сохранении ребенка:", error);
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
      handleCloseDialog();
    },
    onError: (error) => {
      console.error("ChildrenSection: ошибка при сохранении:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить данные ребенка",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (childId: string) => {
      console.log("ChildrenSection: удаление ребенка...", childId);
      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", childId);

      if (error) {
        console.error("ChildrenSection: ошибка при удалении ребенка:", error);
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
      console.error("ChildrenSection: ошибка при удалении:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить ребенка",
      });
    },
  });

  const handleSubmit = useCallback((data: ChildFormData) => {
    console.log("ChildrenSection: вызов handleSubmit с данными:", data);
    mutation.mutate(data);
  }, [mutation, parentId]); // Добавляем parentId в зависимости

  const handleEdit = useCallback((child: any) => {
    console.log("ChildrenSection: начало редактирования ребенка:", child);
    setSelectedChild(child);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((childId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить ребенка?")) {
      deleteMutation.mutate(childId);
    }
  }, [deleteMutation]);

  const handleOpenDialog = useCallback(() => {
    console.log("ChildrenSection: открытие формы добавления ребенка");
    setSelectedChild(null);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    console.log("ChildrenSection: закрытие формы");
    setIsDialogOpen(false);
    setSelectedChild(null);
  }, []);

  if (isLoading) {
    console.log("ChildrenSection: загрузка...");
    return <div>Загрузка...</div>;
  }

  console.log("ChildrenSection: рендер списка детей:", children);

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Дети</h2>
        <Button onClick={handleOpenDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить ребенка
        </Button>
      </div>

      <div className="space-y-4">
        {children.map((child: any) => (
          <div
            key={child.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm"
          >
            <div>
              <h3 className="font-medium">{child.first_name}</h3>
              <p className="text-sm text-gray-500">
                Дата рождения: {new Date(child.birth_date).toLocaleDateString()}
              </p>
              {child.medical_conditions && (
                <p className="text-sm text-red-500">
                  Медицинские противопоказания: {child.medical_conditions}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(child)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(child.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ChildForm
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        initialData={selectedChild}
      />
    </div>
  );
};

export default ChildrenSection;