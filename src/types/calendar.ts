import { Database } from '@/integrations/supabase/types';

export type AppointmentStatus = Database['public']['Enums']['appointment_status'];
export type ScheduleEventType = Database['public']['Enums']['schedule_event_type'];

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status?: AppointmentStatus;
  type?: ScheduleEventType;
}