import { Tables } from './tables';
import { ProfileRow } from './profile-types';

export interface ParentProfile extends Tables['parent_profiles']['Row'] {
  profiles?: ProfileRow;
  children?: Tables['children']['Row'][];
}