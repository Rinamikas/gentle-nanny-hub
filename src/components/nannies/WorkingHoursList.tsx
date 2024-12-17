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
  console.log("Rendering WorkingHoursList for nanny:", nannyId);
  
  const { data: workingHours, isLoading } = useQuery({
    queryKey: ["working-hours", nannyId],
    queryFn: async () => {
      console.log("Fetching working hours for nanny:", nannyId);
      const { data, error } = await supabase
        .from("working_hours")
        .select("*")
        .eq("nanny_id", nannyId)
        .order("work_date")
        .order("start_time");

      if (error) {
        console.error("Error fetching working hours:", error);
        throw error;
      }
      
      console.log("Received working hours:", data);
      return data;
    },
  });

  if (isLoading) {
    console.log("Loading working hours...");
    return <div>Загрузка...</div>;
  }

  console.log("Rendering working hours table with data:", workingHours);

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