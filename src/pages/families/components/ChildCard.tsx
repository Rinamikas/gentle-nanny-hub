import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Child } from "../types/children";

interface ChildCardProps {
  child: Child;
  onEdit: (child: Child) => void;
  onDelete: (childId: string) => void;
}

const ChildCard = ({ child, onEdit, onDelete }: ChildCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
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
          onClick={() => onEdit(child)}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(child.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChildCard;