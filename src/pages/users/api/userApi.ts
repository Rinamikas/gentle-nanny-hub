import { supabase } from "@/integrations/supabase/client";
import type { User } from "../types";

export const fetchUserProfiles = async () => {
  console.log("Начинаем загрузку пользователей...");
  
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*");

  if (profilesError) {
    console.error("Ошибка загрузки профилей:", profilesError);
    throw profilesError;
  }

  console.log("Профили успешно загружены:", profiles);
  return profiles;
};

export const fetchUserRoles = async () => {
  const { data: userRoles, error: rolesError } = await supabase
    .rpc('get_user_roles');

  if (rolesError) {
    console.error("Ошибка загрузки ролей:", rolesError);
    throw rolesError;
  }

  console.log("Роли пользователей успешно загружены:", userRoles);
  return userRoles;
};

export const updateUserProfile = async (id: string, updates: { 
  first_name: string; 
  last_name: string; 
  email: string; 
}) => {
  console.log("Обновляем пользователя с ID:", id);
  console.log("Данные для обновления:", updates);

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
};

export const deleteUserProfile = async (id: string) => {
  console.log("Удаляем пользователя с ID:", id);
  
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

  const { error: deleteError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Ошибка удаления профиля:", deleteError);
    throw deleteError;
  }

  console.log("Профиль успешно удален");
};