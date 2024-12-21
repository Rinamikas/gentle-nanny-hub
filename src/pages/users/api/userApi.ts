import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User } from "../types";

export const fetchUserProfiles = async () => {
  console.log("Начинаем загрузку пользователей...");
  
  try {
    // Сначала получаем профили
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.error("Ошибка загрузки профилей:", profilesError);
      throw profilesError;
    }

    // Затем получаем роли отдельным запросом
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      console.error("Ошибка загрузки ролей:", rolesError);
      throw rolesError;
    }

    // Комбинируем данные
    const enrichedProfiles = profiles.map(profile => ({
      ...profile,
      user_roles: roles.filter(role => role.user_id === profile.id)
        .map(({ role }) => ({ role }))
    }));

    console.log("Профили успешно загружены:", enrichedProfiles);
    return enrichedProfiles;
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

export const updateUserProfile = async (id: string, updates: { 
  first_name: string; 
  last_name: string; 
  email: string; 
}) => {
  console.log("Обновляем пользователя:", { id, updates });
  
  try {
    // Обновляем auth.users через Edge Function
    const { error: authError } = await supabase.functions.invoke('update-user', {
      body: { id, updates }
    });

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
    // Удаляем из auth.users через Edge Function
    const { error: authError } = await supabase.functions.invoke('delete-user', {
      body: { id }
    });

    if (authError) {
      console.error("Ошибка удаления из auth.users:", authError);
      throw authError;
    }

    // Удаляем из profiles
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