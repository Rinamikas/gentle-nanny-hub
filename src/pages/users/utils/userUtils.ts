import type { User } from "../types";

export const combineUserData = (profiles: any[]): User[] => {
  return profiles.map(profile => ({
    ...profile,
    user_roles: profile.user_roles || []
  }));
};