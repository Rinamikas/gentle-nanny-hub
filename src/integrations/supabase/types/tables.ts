import { ProfileTables } from './profile-types';
import { NannyTables } from './nanny-types';
import { ParentTables } from './parent-types';
import { VerificationTables } from './verification-types';

export type { NannyProfile } from './nanny-types';
export type { ParentProfile } from './parent-types';

export interface Tables extends 
  ProfileTables,
  NannyTables,
  ParentTables,
  VerificationTables {}