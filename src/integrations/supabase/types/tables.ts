import { ProfileTables } from './profile-types';
import { NannyTables } from './nanny-types';
import { ParentTables } from './parent-types';
import { VerificationTables } from './verification-types';

export interface Tables extends 
  ProfileTables,
  NannyTables,
  ParentTables,
  VerificationTables {}