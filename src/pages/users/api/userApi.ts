import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User } from "../types";

export const fetchUserProfiles = async () => {
  console.log("Начинаем загрузку пользователей...");
  
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        *,
        user_roles (
          role
        )
      `);

    if (profilesError) {
      console.error("Ошибка загрузки профилей:", profilesError);
      throw profilesError;
    }

    if (!profiles) {
      console.log("Профили не найдены");
      return [];
    }

    console.log("Профили успешно загружены:", profiles);
    return profiles;
  } catch (error) {
    console.error("Критическая ошибка при загрузке профилей:", error);
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: "Не удалось загрузить данные пользователей"
    });
    throw error;
  }
};

export const fetchUserRoles = async () => {
  console.log("Начинаем загрузку ролей пользователей...");
  
  try {
    const { data: userRoles, error: rolesError } = await supabase
      .rpc('get_user_roles');

    if (rolesError) {
      console.error("Ошибка загрузки ролей:", rolesError);
      throw rolesError;
    }

    if (!userRoles) {
      console.log("Роли не найдены");
      return [];
    }

    console.log("Роли пользователей успешно загружены:", userRoles);
    return userRoles;
  } catch (error) {
    console.error("Критическая ошибка при загрузке ролей:", error);
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: "Не удалось загрузить роли пользователей"
    });
    throw error;
  }
};

export const updateUserProfile = async (id: string, updates: { 
  first_name: string; 
  last_name: string; 
  email: string; 
}) => {
  console.log("Обновляем пользователя:", { id, updates });
  
  try {
    // Обновляем auth.users через административные функции
    const { data: authUser, error: authError } = await supabase.auth.admin.updateUserById(
      id,
      {
        email: updates.email,
        user_metadata: {
          first_name: updates.first_name,
          last_name: updates.last_name
        }
      }
    );

    if (authError) {
      console.error("Ошибка обновления auth.users:", authError);
      throw authError;
    }

    // Обновляем profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: updates.first_name,
        last_name: updates.last_name,
        email: updates.email,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (profileError) {
      console.error("Ошибка обновления профиля:", profileError);
      throw profileError;
    }

    console.log("Профиль успешно обновлен");
    return authUser;
  } catch (error) {
    console.error("Критическая ошибка при обновлении профиля:", error);
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: "Не удалось обновить профиль"
    });
    throw error;
  }
};

export const deleteUserProfile = async (id: string) => {
  console.log("Удаляем пользователя с ID:", id);
  
  try {
    // Сначала удаляем из auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      console.error("Ошибка удаления из auth.users:", authError);
      throw authError;
    }

    // Затем удаляем из profiles (должно произойти каскадно из-за внешнего ключа)
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) {
      console.error("Ошибка удаления профиля:", profileError);
      throw profileError;
    }

    console.log("Пользователь успешно удален из обеих таблиц");
  } catch (error) {
    console.error("Критическая ошибка при удалении пользователя:", error);
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: "Не удалось удалить пользователя"
    });
    throw error;
  }
};