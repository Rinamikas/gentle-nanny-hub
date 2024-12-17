import { ProfileTables } from './profile-types';
import { NannyTables } from './nanny-types';
import { ParentTables } from './parent-types';
import { VerificationTables } from './verification-types';

export type NannyProfile = NannyTables['nanny_profiles']['Row'];
export type ParentProfile = ParentTables['parent_profiles']['Row'];

export interface Tables extends 
  ProfileTables,
  NannyTables,
  ParentTables,
  VerificationTables {}