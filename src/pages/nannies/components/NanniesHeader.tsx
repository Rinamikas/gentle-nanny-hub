import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NanniesHeaderProps {
  onCreateClick: () => void;
}

const NanniesHeader = ({ onCreateClick }: NanniesHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Управление нянями</h1>
      <Button onClick={onCreateClick}>
        <Plus className="w-4 h-4 mr-2" />
        Добавить няню
      </Button>
    </div>
  );
};

export default NanniesHeader;