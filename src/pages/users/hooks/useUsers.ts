import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "../types";

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

      // Получаем все профили
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Profiles fetched successfully:", profiles);

      // Получаем все роли через RPC вызов
      const { data: userRoles, error: rolesError } = await supabase
        .rpc('get_user_roles');

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        throw rolesError;
      }

      console.log("User roles fetched successfully:", userRoles);

      // Создаем мапу ролей
      const rolesMap: { [key: string]: { role: string }[] } = {};
      userRoles.forEach((role: { user_id: string; role: string }) => {
        if (!rolesMap[role.user_id]) {
          rolesMap[role.user_id] = [];
        }
        rolesMap[role.user_id].push({ role: role.role });
      });

      // Объединяем данные
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
      console.log("Updating user with ID:", id);
      console.log("Update data:", updates);

      // Обновляем профиль
      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: updates.first_name,
          last_name: updates.last_name,
          email: updates.email,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw updateError;
      }

      console.log("Profile updated successfully:", updatedProfile);
      return updatedProfile;
    },
    onSuccess: () => {
      console.log("Update mutation completed successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Пользователь успешно обновлен");
    },
    onError: (error) => {
      console.error("Error in update mutation:", error);
      toast.error("Ошибка при обновлении пользователя");
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
      toast.success("Пользователь успешно удален");
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      toast.error("Ошибка при удалении пользователя");
    },
  });

  return {
    users,
    isLoading,
    error,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
  };
};