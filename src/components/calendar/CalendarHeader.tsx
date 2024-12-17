import { NannySelect } from "./NannySelect";

interface CalendarHeaderProps {
  selectedNanny?: string;
  onNannySelect: (nannyId: string | undefined) => void;
}

export function CalendarHeader({ selectedNanny, onNannySelect }: CalendarHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <NannySelect value={selectedNanny} onSelect={onNannySelect} />
    </div>
  );
}