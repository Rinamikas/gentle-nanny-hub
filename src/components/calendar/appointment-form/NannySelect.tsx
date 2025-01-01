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
import { format, parse } from "date-fns";

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
      const { data: nannies, error } = await supabase
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
      const availabilityPromises = nannies.map(async (nanny) => {
        const availableDates = await Promise.all(
          selectedDates.map(async ({ date, startTime, endTime }) => {
            const formattedDate = format(date, 'yyyy-MM-dd');
            console.log(`Проверка доступности няни ${nanny.id} на дату ${formattedDate} с ${startTime} до ${endTime}`);

            const { data: workingHours, error: workingHoursError } = await supabase
              .from("working_hours")
              .select("*")
              .eq("nanny_id", nanny.id)
              .eq("work_date", formattedDate)
              .maybeSingle();

            if (workingHoursError) {
              console.error(`Ошибка при проверке рабочих часов для няни ${nanny.id}:`, workingHoursError);
              return false;
            }

            if (!workingHours) {
              console.log(`Нет рабочих часов для няни ${nanny.id} на дату ${formattedDate}`);
              return false;
            }

            // Преобразуем строки времени в объекты Date для корректного сравнения
            const workStart = parse(workingHours.start_time, 'HH:mm:ss', new Date());
            const workEnd = parse(workingHours.end_time, 'HH:mm:ss', new Date());
            const requestStart = parse(startTime, 'HH:mm', new Date());
            const requestEnd = parse(endTime, 'HH:mm', new Date());

            const isWithinWorkingHours = 
              requestStart >= workStart && 
              requestEnd <= workEnd;

            console.log(`Рабочие часы няни ${nanny.id} на ${formattedDate}: ${workingHours.start_time}-${workingHours.end_time}`);
            console.log(`Запрошенное время: ${startTime}-${endTime}`);
            console.log(`В рабочих часах: ${isWithinWorkingHours ? 'да' : 'нет'}`);

            if (!isWithinWorkingHours) {
              return false;
            }

            // Проверяем существующие заявки
            const { data: appointments, error: appointmentsError } = await supabase
              .from("appointments")
              .select("*")
              .eq("nanny_id", nanny.id)
              .eq("status", "confirmed")
              .neq("status", "cancelled");

            if (appointmentsError) {
              console.error(`Ошибка при проверке заявок для няни ${nanny.id}:`, appointmentsError);
              return false;
            }

            const hasConflict = appointments?.some(appointment => {
              const appointmentStart = new Date(appointment.start_time);
              const appointmentEnd = new Date(appointment.end_time);
              const requestedStart = new Date(`${formattedDate}T${startTime}`);
              const requestedEnd = new Date(`${formattedDate}T${endTime}`);

              const conflict = (
                (requestedStart >= appointmentStart && requestedStart < appointmentEnd) ||
                (requestedEnd > appointmentStart && requestedEnd <= appointmentEnd) ||
                (requestedStart <= appointmentStart && requestedEnd >= appointmentEnd)
              );

              if (conflict) {
                console.log(`Найден конфликт с заявкой для няни ${nanny.id} на ${formattedDate}`);
                console.log('Существующая заявка:', {
                  start: appointmentStart,
                  end: appointmentEnd
                });
                console.log('Запрашиваемое время:', {
                  start: requestedStart,
                  end: requestedEnd
                });
              }

              return conflict;
            });

            if (hasConflict) {
              console.log(`Есть конфликты с существующими заявками для няни ${nanny.id} на ${formattedDate}`);
              return false;
            }

            console.log(`Няня ${nanny.id} доступна на ${formattedDate}`);
            return true;
          })
        );

        const availableCount = availableDates.filter(Boolean).length;
        let status: "available" | "partially" | "unavailable" = "unavailable";

        if (availableCount === selectedDates.length) {
          status = "available";
        } else if (availableCount > 0) {
          status = "partially";
        }

        console.log(`Итоговый статус няни ${nanny.id}: ${status} (доступна для ${availableCount} из ${selectedDates.length} дат)`);

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