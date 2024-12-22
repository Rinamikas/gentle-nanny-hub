import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/calendar";
import { getStatusColor, getEventTypeColor, getEventTypeTitle } from "./utils";

export function useCalendarEvents(selectedNanny?: string) {
  return useQuery({
    queryKey: ["calendar-events", selectedNanny],
    queryFn: async () => {
      console.log("Загрузка событий календаря для няни:", selectedNanny);
      
      try {
        // Загружаем заявки
        const appointmentsQuery = supabase
          .from('appointments')
          .select(`
            *,
            nanny_profiles (
              id,
              photo_url
            ),
            parent_profiles (
              id
            )
          `);

        if (selectedNanny && selectedNanny !== 'all') {
          appointmentsQuery.eq('nanny_id', selectedNanny);
        }

        const { data: appointments, error: appointmentsError } = await appointmentsQuery;

        if (appointmentsError) {
          console.error("Ошибка загрузки заявок:", appointmentsError);
          throw appointmentsError;
        }

        console.log("Загруженные заявки:", appointments);

        // Загружаем события расписания с правильным форматом запроса
        const scheduleQuery = supabase
          .from('schedule_events')
          .select(`
            id,
            nanny_id,
            event_type,
            start_time,
            end_time,
            notes,
            nanny_profiles (
              id,
              photo_url
            )
          `);

        if (selectedNanny && selectedNanny !== 'all') {
          scheduleQuery.eq('nanny_id', selectedNanny);
        }

        const { data: scheduleEvents, error: scheduleError } = await scheduleQuery;

        if (scheduleError) {
          console.error("Ошибка загрузки событий расписания:", scheduleError);
          throw scheduleError;
        }

        console.log("Загруженные события расписания:", scheduleEvents);

        // Загружаем рабочие часы
        const workingHoursQuery = supabase
          .from('working_hours')
          .select('*');

        if (selectedNanny && selectedNanny !== 'all') {
          workingHoursQuery.eq('nanny_id', selectedNanny);
        }

        const { data: workingHours, error: workingHoursError } = await workingHoursQuery;

        if (workingHoursError) {
          console.error("Ошибка загрузки рабочих часов:", workingHoursError);
          throw workingHoursError;
        }

        console.log("Загруженные рабочие часы:", workingHours);

        const calendarEvents: CalendarEvent[] = [
          ...(appointments?.map(apt => ({
            id: apt.id,
            title: `Заявка ${apt.id.slice(0, 8)}`,
            start: new Date(apt.start_time),
            end: new Date(apt.end_time),
            type: 'appointment' as const,
            status: apt.status,
            nannyId: apt.nanny_id,
            parentId: apt.parent_id,
            notes: apt.notes,
            color: getStatusColor(apt.status),
          })) || []),
          ...(scheduleEvents?.map(evt => ({
            id: evt.id,
            title: getEventTypeTitle(evt.event_type),
            start: new Date(evt.start_time),
            end: new Date(evt.end_time),
            type: 'schedule_event' as const,
            eventType: evt.event_type,
            nannyId: evt.nanny_id,
            notes: evt.notes,
            color: getEventTypeColor(evt.event_type),
          })) || []),
          ...(workingHours?.map(wh => ({
            id: wh.id,
            title: 'Рабочие часы',
            start: new Date(`${wh.work_date}T${wh.start_time}`),
            end: new Date(`${wh.work_date}T${wh.end_time}`),
            type: 'working_hours' as const,
            nannyId: wh.nanny_id,
            color: '#E2E8F0',
          })) || [])
        ];

        return calendarEvents;
      } catch (error) {
        console.error("Ошибка загрузки событий:", error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
}