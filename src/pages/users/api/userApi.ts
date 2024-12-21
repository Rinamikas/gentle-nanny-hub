import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User } from "../types";

export const fetchUserProfiles = async () => {
  console.log("Начинаем загрузку пользователей...");
  
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

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
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: updates.first_name,
        last_name: updates.last_name,
        email: updates.email,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Ошибка обновления профиля:", error);
      throw error;
    }

    // Получаем обновленные данные
    const { data: updatedProfile, error: fetchError } = await supabase
      .from("profiles")
      .select()
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("Ошибка получения обновленного профиля:", fetchError);
      throw fetchError;
    }

    console.log("Профиль успешно обновлен:", updatedProfile);
    return updatedProfile;
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
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Ошибка удаления профиля:", error);
      throw error;
    }

    console.log("Профиль успешно удален");
  } catch (error) {
    console.error("Критическая ошибка при удалении профиля:", error);
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: "Не удалось удалить профиль"
    });
    throw error;
  }
};