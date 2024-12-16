import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NanniesHeaderProps {
  showDeleted: boolean;
  onToggleDeleted: () => void;
  onAddNanny: () => void;
}

const NanniesHeader = ({ showDeleted, onToggleDeleted, onAddNanny }: NanniesHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          {showDeleted ? "Удаленные няни" : "Список нянь"}
        </h1>
        <Button
          variant="outline"
          onClick={onToggleDeleted}
        >
          {showDeleted ? "Показать активных" : "Показать удаленных"}
        </Button>
      </div>
      {!showDeleted && (
        <Button onClick={onAddNanny} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" />
          Добавить няню
        </Button>
      )}
    </div>
  );
};

export default NanniesHeader;