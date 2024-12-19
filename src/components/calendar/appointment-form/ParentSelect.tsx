import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ParentSelectProps {
  value: string;
  onSelect: (parentId: string) => void;
}

export function ParentSelect({ value, onSelect }: ParentSelectProps) {
  const { data: parents, isLoading } = useQuery({
    queryKey: ["parents"],
    queryFn: async () => {
      console.log("Загрузка списка родителей...");
      const { data, error } = await supabase
        .from("parent_profiles")
        .select(`
          id,
          profiles (
            first_name,
            last_name
          )
        `);

      if (error) {
        console.error("Ошибка загрузки родителей:", error);
        throw error;
      }

      console.log("Загруженные родители:", data);
      return data;
    },
  });

  if (isLoading) return null;

  return (
    <div className="grid gap-2">
      <Label>Семья</Label>
      <Select value={value} onValueChange={onSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Выберите семью" />
        </SelectTrigger>
        <SelectContent>
          {parents?.map((parent) => (
            <SelectItem key={parent.id} value={parent.id}>
              {parent.profiles?.first_name} {parent.profiles?.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}