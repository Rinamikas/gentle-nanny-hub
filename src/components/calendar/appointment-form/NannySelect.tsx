import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NannyAvailabilityIndicator } from "./NannyAvailabilityIndicator";

interface NannySelectProps {
  value?: string;
  onSelect: (nannyId: string) => void;
  selectedDates: { date: Date; startTime: string; endTime: string; }[];
}

export function NannySelect({ value, onSelect, selectedDates }: NannySelectProps) {
  const { data: nannies, isLoading } = useQuery({
    queryKey: ["nannies", selectedDates],
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
        .eq("is_deleted", false);

      if (error) {
        console.error("Ошибка загрузки нянь:", error);
        throw error;
      }

      // Проверяем доступность каждой няни
      const availabilityPromises = data.map(async (nanny) => {
        const availableDates = await Promise.all(
          selectedDates.map(async ({ date, startTime, endTime }) => {
            const startDateTime = new Date(date);
            const [startHours, startMinutes] = startTime.split(":");
            startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

            const endDateTime = new Date(date);
            const [endHours, endMinutes] = endTime.split(":");
            endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

            const { data: conflicts } = await supabase
              .from("appointments")
              .select("id")
              .eq("nanny_id", nanny.id)
              .neq("status", "cancelled")
              .or(`start_time.lte.${endDateTime.toISOString()},end_time.gte.${startDateTime.toISOString()}`);

            return conflicts?.length === 0;
          })
        );

        const availableCount = availableDates.filter(Boolean).length;
        let status: "available" | "partially" | "unavailable" = "unavailable";

        if (availableCount === selectedDates.length) {
          status = "available";
        } else if (availableCount > 0) {
          status = "partially";
        }

        return {
          ...nanny,
          availability: status,
        };
      });

      const nanniesWithAvailability = await Promise.all(availabilityPromises);
      console.log("Няни с доступностью:", nanniesWithAvailability);
      return nanniesWithAvailability;
    },
    enabled: selectedDates.length > 0,
  });

  if (isLoading || !selectedDates.length) return null;

  return (
    <Select value={value} onValueChange={onSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Выберите няню" />
      </SelectTrigger>
      <SelectContent>
        {nannies?.map((nanny) => (
          <SelectItem
            key={nanny.id}
            value={nanny.id}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <NannyAvailabilityIndicator status={nanny.availability} />
              <span>
                {nanny.profiles?.first_name} {nanny.profiles?.last_name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}