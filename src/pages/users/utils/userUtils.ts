import type { User } from "../types";

export const combineUserData = (profiles: any[], roles: any[]): User[] => {
  const rolesMap: { [key: string]: { role: string }[] } = {};
  
  roles.forEach((role: { user_id: string; role: string }) => {
    if (!rolesMap[role.user_id]) {
      rolesMap[role.user_id] = [];
    }
    rolesMap[role.user_id].push({ role: role.role });
  });

  return profiles.map(profile => ({
    ...profile,
    user_roles: rolesMap[profile.id] || []
  }));
};