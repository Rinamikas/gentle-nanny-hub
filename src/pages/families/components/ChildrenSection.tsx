import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ChildForm from "./ChildForm";
import ChildCard from "./ChildCard";
import { useChildrenData } from "../hooks/useChildrenData";
import type { Child, ChildFormData } from "../types/children";

interface ChildrenSectionProps {
  parentId: string;
}

const ChildrenSection = ({ parentId }: ChildrenSectionProps) => {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  console.log("ChildrenSection: начало рендера с parentId =", parentId);
  console.log("ChildrenSection: текущее состояние формы:", { isDialogOpen, selectedChild });

  const { children, isLoading, mutation, deleteMutation } = useChildrenData(parentId);

  const handleSubmit = useCallback((data: ChildFormData) => {
    console.log("ChildrenSection: вызов handleSubmit с данными:", data);
    mutation.mutate({ data, selectedChildId: selectedChild?.id });
    handleCloseDialog();
  }, [mutation, selectedChild]);

  const handleEdit = useCallback((child: Child) => {
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
        {children.map((child: Child) => (
          <ChildCard
            key={child.id}
            child={child}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
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