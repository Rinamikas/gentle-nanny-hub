import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types/database";

type UserRole = Database['public']['Enums']['user_role'];

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching users...");
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Ошибка аутентификации");
      }

      if (!session) {
        console.error("No active session");
        throw new Error("Пользователь не аутентифицирован");
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Profiles fetched successfully:", profiles);

      const { data: userRoles, error: rolesError } = await supabase
        .rpc('get_user_roles');

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        throw rolesError;
      }

      console.log("User roles fetched successfully:", userRoles);

      const rolesMap: { [key: string]: UserRole[] } = {};
      userRoles.forEach((ur: { user_id: string; role: UserRole }) => {
        if (!rolesMap[ur.user_id]) {
          rolesMap[ur.user_id] = [];
        }
        rolesMap[ur.user_id].push(ur.role);
      });

      const usersWithRoles = profiles.map(profile => ({
        ...profile,
        user_roles: rolesMap[profile.id] || []
      }));

      console.log("Final users with roles:", usersWithRoles);
      return usersWithRoles;
    },
  });

  const changeUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      console.log("Changing role for user:", userId, "to:", newRole);
      
      const { data: currentRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      const currentRole = currentRoles?.[0]?.role;
      console.log("Current role:", currentRole);

      if (currentRole === newRole) {
        throw new Error("Новая роль совпадает с текущей");
      }

      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (roleError) throw roleError;

      if (currentRole === 'nanny') {
        const { error: nannyError } = await supabase
          .from("nanny_profiles")
          .update({ deleted_at: new Date().toISOString() })
          .eq("user_id", userId);
        
        if (nannyError) throw nannyError;
      } else if (currentRole === 'parent') {
        const { error: parentError } = await supabase
          .from("parent_profiles")
          .update({ deleted_at: new Date().toISOString() })
          .eq("user_id", userId);
        
        if (parentError) throw parentError;
      }

      if (newRole === 'nanny') {
        const { error: newNannyError } = await supabase
          .from("nanny_profiles")
          .insert([{ user_id: userId }]);
        
        if (newNannyError) throw newNannyError;
      } else if (newRole === 'parent') {
        const { error: newParentError } = await supabase
          .from("parent_profiles")
          .insert([{ user_id: userId }]);
        
        if (newParentError) throw newParentError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Успешно",
        description: "Роль пользователя успешно изменена",
      });
    },
    onError: (error) => {
      console.error("Error changing user role:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить роль пользователя",
        variant: "destructive",
      });
    },
  });

  return {
    users,
    isLoading,
    error,
    changeUserRole: (userId: string, newRole: UserRole) => 
      changeUserRoleMutation.mutateAsync({ userId, newRole }),
  };
};
