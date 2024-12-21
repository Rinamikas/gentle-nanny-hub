import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User } from "../types";

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Начинаем загрузку пользователей...");
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Ошибка сессии:", sessionError);
        throw new Error("Ошибка аутентификации");
      }

      if (!session) {
        console.error("Нет активной сессии");
        throw new Error("Пользователь не аутентифицирован");
      }

      // Получаем все профили
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) {
        console.error("Ошибка загрузки профилей:", profilesError);
        throw profilesError;
      }

      console.log("Профили успешно загружены:", profiles);

      // Получаем все роли через RPC вызов
      const { data: userRoles, error: rolesError } = await supabase
        .rpc('get_user_roles');

      if (rolesError) {
        console.error("Ошибка загрузки ролей:", rolesError);
        throw rolesError;
      }

      console.log("Роли пользователей успешно загружены:", userRoles);

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

      console.log("Итоговые данные пользователей с ролями:", usersWithRoles);
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
      console.log("Обновляем пользователя с ID:", id);
      console.log("Данные для обновления:", updates);

      // Проверяем существование профиля перед обновлением
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select()
        .eq("id", id)
        .maybeSingle();

      if (checkError) {
        console.error("Ошибка проверки профиля:", checkError);
        throw checkError;
      }

      if (!existingProfile) {
        console.error("Профиль не найден");
        throw new Error("Профиль не найден");
      }

      // Обновляем профиль
      const { data, error } = await supabase
        .from("profiles")
        .update({
          first_name: updates.first_name,
          last_name: updates.last_name,
          email: updates.email,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Ошибка обновления профиля:", error);
        throw error;
      }

      if (!data) {
        console.error("Данные не получены после обновления");
        throw new Error("Данные не получены после обновления");
      }

      console.log("Профиль успешно обновлен:", data);
      return data;
    },
    onSuccess: () => {
      console.log("Мутация обновления успешно завершена");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Успешно",
        description: "Пользователь успешно обновлен",
      });
    },
    onError: (error) => {
      console.error("Ошибка в мутации обновления:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить пользователя",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Удаляем пользователя с ID:", id);
      
      // Проверяем существование профиля перед удалением
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select()
        .eq("id", id)
        .maybeSingle();

      if (checkError) {
        console.error("Ошибка проверки профиля:", checkError);
        throw checkError;
      }

      if (!existingProfile) {
        console.error("Профиль не найден");
        throw new Error("Профиль не найден");
      }

      try {
        // Удаляем профиль пользователя
        const { error: profileError } = await supabase
          .from("profiles")
          .delete()
          .eq("id", id);

        if (profileError) {
          console.error("Ошибка удаления профиля пользователя:", profileError);
          throw profileError;
        }

        console.log("Пользователь успешно удален");
      } catch (error) {
        console.error("Ошибка в мутации удаления:", error);
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
      console.error("Ошибка удаления пользователя:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
      });
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