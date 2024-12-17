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
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface WorkingHoursListProps {
  nannyId: string;
}

export function WorkingHoursList({ nannyId }: WorkingHoursListProps) {
  const { data: workingHours, isLoading } = useQuery({
    queryKey: ["working-hours", nannyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("working_hours")
        .select("*")
        .eq("nanny_id", nannyId)
        .order("work_date")
        .order("start_time");

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
          <TableHead>Дата</TableHead>
          <TableHead>Начало работы</TableHead>
          <TableHead>Конец работы</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workingHours?.map((hours) => (
          <TableRow key={hours.id}>
            <TableCell>
              {format(new Date(hours.work_date), "d MMMM yyyy", { locale: ru })}
            </TableCell>
            <TableCell>{hours.start_time}</TableCell>
            <TableCell>{hours.end_time}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}