import { Tables } from './tables';
import { Functions } from './functions';
import { UserRole, VerificationStatus } from './enums';

export interface Database {
  public: {
    Tables: Tables
    Functions: Functions
    Enums: {
      user_role: UserRole
      verification_status: VerificationStatus
    }
  }
}