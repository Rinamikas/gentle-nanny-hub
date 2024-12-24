import { Json } from './json-types';
import { Tables } from './tables-types';
import { Functions } from './functions-types';
import { UserRole, VerificationStatus, ParentStatus, AppointmentStatus, ScheduleEventType } from './enums';

export interface Database {
  public: {
    Tables: Tables;
    Functions: Functions;
    Enums: {
      user_role: UserRole;
      verification_status: VerificationStatus;
      parent_status: ParentStatus;
      appointment_status: AppointmentStatus;
      schedule_event_type: ScheduleEventType;
    };
  };
}

export type { Tables };