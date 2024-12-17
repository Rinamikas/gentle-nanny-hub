import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WorkingHoursListProps {
  nannyId: string;
}

const daysOfWeek = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

export function WorkingHoursList({ nannyId }: WorkingHoursListProps) {
  const { data: workingHours, isLoading } = useQuery({
    queryKey: ["working-hours", nannyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("working_hours")
        .select("*")
        .eq("nanny_id", nannyId)
        .order("day_of_week");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>День недели</TableHead>
          <TableHead>Начало работы</TableHead>
          <TableHead>Конец работы</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workingHours?.map((hours) => (
          <TableRow key={hours.id}>
            <TableCell>{daysOfWeek[hours.day_of_week]}</TableCell>
            <TableCell>{hours.start_time}</TableCell>
            <TableCell>{hours.end_time}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}