import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NanniesHeaderProps {
  onAddNanny: () => void;
}

const NanniesHeader = ({ onAddNanny }: NanniesHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Список нянь
      </h1>
      <Button onClick={onAddNanny} className="bg-primary">
        <Plus className="w-4 h-4 mr-2" />
        Добавить няню
      </Button>
    </div>
  );
};

export default NanniesHeader;