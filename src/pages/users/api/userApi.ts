import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User } from "../types";

export const fetchUserProfiles = async () => {
  console.log("Начинаем загрузку пользователей...");
  
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .throwOnError()
      .maybeSingle();

    if (profilesError) {
      console.error("Ошибка загрузки профилей:", profilesError);
      throw profilesError;
    }

    if (!profiles) {
      console.log("Профили не найдены");
      return [];
    }

    console.log("Профили успешно загружены:", profiles);
    return [profiles]; // Возвращаем массив даже с одним профилем
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
  try {
    const { data: userRoles, error: rolesError } = await supabase
      .rpc('get_user_roles')
      .throwOnError();

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
  console.log("Обновляем пользователя с ID:", id);
  console.log("Данные для обновления:", updates);

  try {
    // Сначала проверяем существование профиля
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select()
      .eq("id", id)
      .throwOnError()
      .maybeSingle();

    if (checkError) {
      console.error("Ошибка проверки профиля:", checkError);
      throw checkError;
    }

    if (!existingProfile) {
      const error = new Error("Профиль не найден");
      console.error(error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Профиль пользователя не найден"
      });
      throw error;
    }

    // Если профиль существует, обновляем его
    const { data, error } = await supabase
      .from("profiles")
      .update({
        first_name: updates.first_name,
        last_name: updates.last_name,
        email: updates.email,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .throwOnError()
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
  } catch (error) {
    console.error("Критическая ошибка при обновлении профиля:", error);
    throw error;
  }
};

export const deleteUserProfile = async (id: string) => {
  console.log("Удаляем пользователя с ID:", id);
  
  try {
    // Сначала проверяем существование профиля
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select()
      .eq("id", id)
      .throwOnError()
      .maybeSingle();

    if (checkError) {
      console.error("Ошибка проверки профиля:", checkError);
      throw checkError;
    }

    if (!existingProfile) {
      console.error("Профиль не найден");
      throw new Error("Профиль не найден");
    }

    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id)
      .throwOnError();

    if (deleteError) {
      console.error("Ошибка удаления профиля:", deleteError);
      throw deleteError;
    }

    console.log("Профиль успешно удален");
  } catch (error) {
    console.error("Критическая ошибка при удалении профиля:", error);
    throw error;
  }
};