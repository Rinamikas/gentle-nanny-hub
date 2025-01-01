import { Tables } from './tables';
import { Functions } from './functions';
import { UserRole, VerificationStatus, ParentStatus } from './enums';

export interface Database {
  public: {
    Tables: Tables
    Functions: Functions
    Enums: {
      user_role: UserRole
      verification_status: VerificationStatus
      parent_status: ParentStatus
    }
  }
}