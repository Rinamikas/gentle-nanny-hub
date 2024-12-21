import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { fetchUserProfiles, fetchUserRoles, updateUserProfile, deleteUserProfile } from "../api/userApi";
import { combineUserData } from "../utils/userUtils";
import type { User } from "../types";

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const profiles = await fetchUserProfiles();
      const userRoles = await fetchUserRoles();
      return combineUserData(profiles, userRoles);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUserProfile,
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
    mutationFn: deleteUserProfile,
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