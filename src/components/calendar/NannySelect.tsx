import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NannySelectProps {
  value?: string;
  onSelect: (nannyId: string | undefined) => void;
}

export function NannySelect({ value, onSelect }: NannySelectProps) {
  const { data: nannies, isLoading } = useQuery({
    queryKey: ["nannies"],
    queryFn: async () => {
      console.log("Загрузка списка нянь...");
      const { data, error } = await supabase
        .from("nanny_profiles")
        .select(`
          id,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq("is_deleted", false)
        .order("created_at");

      if (error) {
        console.error("Ошибка загрузки нянь:", error);
        throw error;
      }

      console.log("Загруженные няни:", data);
      return data;
    },
  });

  if (isLoading) return null;

  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Выберите няню" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Все няни</SelectItem>
        {nannies?.map((nanny) => (
          <SelectItem key={nanny.id} value={nanny.id}>
            {nanny.profiles?.first_name} {nanny.profiles?.last_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}