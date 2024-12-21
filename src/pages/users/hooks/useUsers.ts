import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User, UserRoleType } from "../types";

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

      const rolesMap: { [key: string]: { role: string }[] } = {};
      userRoles.forEach((role: { user_id: string; role: string }) => {
        if (!rolesMap[role.user_id]) {
          rolesMap[role.user_id] = [];
        }
        rolesMap[role.user_id].push({ role: role.role });
      });

      const usersWithRoles = profiles.map(profile => ({
        ...profile,
        user_roles: rolesMap[profile.id] || []
      }));

      console.log("Final users with roles:", usersWithRoles);
      return usersWithRoles as User[];
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { first_name: string; last_name: string; email: string };
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Успешно",
        description: "Пользователь успешно обновлен",
      });
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить пользователя",
        variant: "destructive",
      });
    },
  });

  const changeUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRoleType }) => {
      console.log("Changing role for user:", userId, "to:", newRole);
      
      // Получаем текущую роль и профили пользователя
      const { data: currentRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      const currentRole = currentRoles?.[0]?.role;
      console.log("Current role:", currentRole);

      if (currentRole === newRole) {
        throw new Error("Новая роль совпадает с текущей");
      }

      // Начинаем транзакцию
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (roleError) throw roleError;

      // Мягко удаляем старый профиль
      if (currentRole === 'nanny') {
        const { error: nannyError } = await supabase
          .from("nanny_profiles")
          .update({ 
            is_deleted: true,
            deleted_at: new Date().toISOString()
          })
          .eq("user_id", userId);
        
        if (nannyError) throw nannyError;
      } else if (currentRole === 'parent') {
        const { error: parentError } = await supabase
          .from("parent_profiles")
          .update({ 
            is_deleted: true,
            deleted_at: new Date().toISOString()
          })
          .eq("user_id", userId);
        
        if (parentError) throw parentError;
      }

      // Создаем новый профиль
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

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting user with ID:", id);
      
      try {
        // Удаляем профиль пользователя
        const { error: profileError } = await supabase
          .from("profiles")
          .delete()
          .eq("id", id);

        if (profileError) {
          console.error("Error deleting user profile:", profileError);
          throw profileError;
        }

        console.log("User successfully deleted");
      } catch (error) {
        console.error("Error in delete mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Успешно",
        description: "Пользователь успешно удален",
      });
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
        variant: "destructive",
      });
    },
  });

  return {
    users,
    isLoading,
    error,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    changeUserRole: (userId: string, newRole: UserRoleType) => 
      changeUserRoleMutation.mutate({ userId, newRole }),
  };
};