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

      // Получаем профили
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Получаем роли отдельным запросом
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        throw rolesError;
      }

      // Создаем мапу ролей по user_id
      const rolesMap = roles.reduce((acc: { [key: string]: { role: string }[] }, role) => {
        if (!acc[role.user_id]) {
          acc[role.user_id] = [];
        }
        acc[role.user_id].push({ role: role.role });
        return acc;
      }, {});

      // Объединяем данные
      const usersWithRoles = profiles.map(profile => ({
        ...profile,
        user_roles: rolesMap[profile.id] || []
      }));

      console.log("Successfully fetched users with roles:", usersWithRoles);
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
      toast.success("Пользователь успешно обновлен");
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Ошибка при обновлении пользователя");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
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