import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ru } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent, EventModalData } from "@/types/calendar";
import { EventModal } from "./EventModal";
import { useToast } from "@/hooks/use-toast";
import { dateToISOString } from "@/utils/dateUtils";

const locales = {
  'ru': ru,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DragAndDropCalendar = withDragAndDrop(Calendar);

export default function AppointmentsCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modalData, setModalData] = useState<EventModalData>({ isOpen: false, event: null });
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    console.log("Загрузка событий календаря...");
    
    try {
      // Загружаем заявки
      const { data: appointments, error: appointmentsError } = await supabase
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

      if (appointmentsError) throw appointmentsError;

      // Загружаем события расписания
      const { data: scheduleEvents, error: scheduleError } = await supabase
        .from('schedule_events')
        .select(`
          *,
          nanny_profiles (
            id,
            photo_url
          )
        `);

      if (scheduleError) throw scheduleError;

      console.log("Загруженные заявки:", appointments);
      console.log("Загруженные события расписания:", scheduleEvents);

      const calendarEvents: CalendarEvent[] = [
        ...appointments.map(apt => ({
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
        })),
        ...scheduleEvents.map(evt => ({
          id: evt.id,
          title: getEventTypeTitle(evt.event_type),
          start: new Date(evt.start_time),
          end: new Date(evt.end_time),
          type: 'schedule_event' as const,
          eventType: evt.event_type,
          nannyId: evt.nanny_id,
          notes: evt.notes,
          color: getEventTypeColor(evt.event_type),
        }))
      ];

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Ошибка загрузки событий:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить события календаря",
        variant: "destructive",
      });
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Клик по событию:", event);
    setModalData({ isOpen: true, event });
  };

  const handleEventDrop = async ({ event, start, end }: any) => {
    console.log("Перемещение события:", { event, start, end });
    
    try {
      if (event.type === 'appointment') {
        const { error } = await supabase
          .from('appointments')
          .update({
            start_time: dateToISOString(start),
            end_time: dateToISOString(end),
          })
          .eq('id', event.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('schedule_events')
          .update({
            start_time: dateToISOString(start),
            end_time: dateToISOString(end),
          })
          .eq('id', event.id);

        if (error) throw error;
      }

      await loadEvents();
      toast({
        title: "Успешно",
        description: "Событие перемещено",
      });
    } catch (error) {
      console.error("Ошибка при перемещении события:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось переместить событие",
        variant: "destructive",
      });
    }
  };

  const handleEventSave = async (updatedEvent: CalendarEvent) => {
    console.log("Сохранение события:", updatedEvent);
    
    try {
      if (updatedEvent.type === 'appointment') {
        const { error } = await supabase
          .from('appointments')
          .update({
            start_time: dateToISOString(updatedEvent.start),
            end_time: dateToISOString(updatedEvent.end),
            notes: updatedEvent.notes,
          })
          .eq('id', updatedEvent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('schedule_events')
          .update({
            start_time: dateToISOString(updatedEvent.start),
            end_time: dateToISOString(updatedEvent.end),
            notes: updatedEvent.notes,
          })
          .eq('id', updatedEvent.id);

        if (error) throw error;
      }

      await loadEvents();
      toast({
        title: "Успешно",
        description: "Событие обновлено",
      });
    } catch (error) {
      console.error("Ошибка при сохранении события:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить событие",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-[800px] p-4">
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        onSelectEvent={handleEventClick}
        onEventDrop={handleEventDrop}
        draggableAccessor={() => true}
        eventPropGetter={(event: CalendarEvent) => ({
          style: {
            backgroundColor: event.color,
          },
        })}
        messages={{
          next: "Следующий",
          previous: "Предыдущий",
          today: "Сегодня",
          month: "Месяц",
          week: "Неделя",
          day: "День",
          agenda: "Список",
          date: "Дата",
          time: "Время",
          event: "Событие",
        }}
        defaultView={Views.MONTH}
      />
      
      <EventModal
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ isOpen: false, event: null })}
        event={modalData.event}
        onSave={handleEventSave}
      />
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return '#FFA500';
    case 'confirmed':
      return '#4CAF50';
    case 'cancelled':
      return '#F44336';
    case 'completed':
      return '#2196F3';
    default:
      return '#9E9E9E';
  }
}

function getEventTypeColor(type: string): string {
  switch (type) {
    case 'sick_leave':
      return '#FF5252';
    case 'vacation':
      return '#7C4DFF';
    case 'busy':
      return '#FF9800';
    case 'break':
      return '#607D8B';
    default:
      return '#9E9E9E';
  }
}

function getEventTypeTitle(type: string): string {
  switch (type) {
    case 'sick_leave':
      return 'Больничный';
    case 'vacation':
      return 'Отпуск';
    case 'busy':
      return 'Занято';
    case 'break':
      return 'Перерыв';
    default:
      return 'Событие';
  }
}