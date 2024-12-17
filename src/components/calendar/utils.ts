import { AppointmentStatus, ScheduleEventType } from "@/types/calendar";

export function getStatusColor(status: AppointmentStatus): string {
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

export function getEventTypeColor(type: ScheduleEventType): string {
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

export function getEventTypeTitle(type: ScheduleEventType): string {
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