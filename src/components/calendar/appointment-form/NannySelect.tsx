import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import LoadingScreen from "@/components/LoadingScreen";

interface NannySelectProps {
  value?: string;
  onSelect: (value: string) => void;
  selectedDates?: Array<{ date: Date; startTime: string; endTime: string }>;
}

export function NannySelect({ value, onSelect, selectedDates }: NannySelectProps) {
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
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Ошибка при загрузке нянь:", error);
        throw error;
      }

      console.log("Загружены няни:", data);
      return data;
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <FormField
      name="nanny"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Няня</FormLabel>
          <Select
            value={value}
            onValueChange={(value) => {
              console.log("Выбрана няня:", value);
              onSelect(value);
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Выберите няню" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {nannies?.map((nanny) => (
                <SelectItem key={nanny.id} value={nanny.id}>
                  {nanny.profiles?.first_name} {nanny.profiles?.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}