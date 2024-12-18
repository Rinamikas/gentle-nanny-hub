import { useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ru } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent, EventModalData } from "@/types/calendar";
import { EventModal } from "./EventModal";
import { AppointmentForm } from "./AppointmentForm";
import { useToast } from "@/hooks/use-toast";
import { dateToISOString } from "@/utils/dateUtils";
import { CalendarHeader } from "./CalendarHeader";
import { useCalendarEvents } from "./useCalendarEvents";

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
  const [selectedNanny, setSelectedNanny] = useState<string>();
  const [modalData, setModalData] = useState<EventModalData>({ isOpen: false, event: null });
  const [appointmentForm, setAppointmentForm] = useState({ isOpen: false, selectedDate: undefined as Date | undefined });
  const { toast } = useToast();
  const { data: events = [], isLoading, refetch } = useCalendarEvents(selectedNanny);

  console.log("Текущая выбранная няня:", selectedNanny);
  console.log("События календаря:", events);

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Клик по событию:", event);
    setModalData({ isOpen: true, event });
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setAppointmentForm({ isOpen: true, selectedDate: start });
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
      } else if (event.type === 'schedule_event') {
        const { error } = await supabase
          .from('schedule_events')
          .update({
            start_time: dateToISOString(start),
            end_time: dateToISOString(end),
          })
          .eq('id', event.id);

        if (error) throw error;
      } else if (event.type === 'working_hours') {
        const workDate = format(start, 'yyyy-MM-dd');
        const startTime = format(start, 'HH:mm:ss');
        const endTime = format(end, 'HH:mm:ss');

        const { error } = await supabase
          .from('working_hours')
          .update({
            work_date: workDate,
            start_time: startTime,
            end_time: endTime,
          })
          .eq('id', event.id);

        if (error) throw error;
      }

      await refetch();

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
      } else if (updatedEvent.type === 'schedule_event') {
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

      await refetch();

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

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <CalendarHeader 
        selectedNanny={selectedNanny} 
        onNannySelect={setSelectedNanny} 
      />
      
      <div className="h-[800px]">
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          startAccessor={(event: CalendarEvent) => event.start}
          endAccessor={(event: CalendarEvent) => event.end}
          style={{ height: "100%" }}
          onSelectEvent={handleEventClick}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          selectable
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

        <AppointmentForm
          isOpen={appointmentForm.isOpen}
          onClose={() => setAppointmentForm({ isOpen: false, selectedDate: undefined })}
          selectedDate={appointmentForm.selectedDate}
          selectedNanny={selectedNanny}
        />
      </div>
    </div>
  );
}