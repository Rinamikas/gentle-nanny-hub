import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User, UserRole } from "../types";

export const fetchUserProfiles = async () => {
  console.log("Начинаем загрузку пользователей...");
  
  // Проверяем сессию перед запросом
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.error("Сессия отсутствует");
    throw new Error("Необходима авторизация");
  }

  let retries = 3;
  
  while (retries > 0) {
    try {
      // Сначала получаем профили
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) {
        console.error("Ошибка загрузки профилей:", profilesError);
        throw profilesError;
      }

      console.log("Загружены профили:", profiles);

      // Используем RPC-функцию вместо прямого запроса к таблице
      const { data: roles, error: rolesError } = await supabase
        .rpc('get_user_roles');

      if (rolesError) {
        console.error("Ошибка загрузки ролей:", rolesError);
        throw rolesError;
      }

      console.log("Загружены роли:", roles);

      // Комбинируем данные и приводим роли к правильному типу
      const enrichedProfiles = profiles.map(profile => ({
        ...profile,
        user_roles: roles
          .filter(role => role.user_id === profile.id)
          .map(({ role }) => ({ role: role as UserRole }))
      }));

      console.log("Профили успешно загружены:", enrichedProfiles);
      return enrichedProfiles;
      
    } catch (error: any) {
      console.error(`Попытка ${4 - retries}/3 загрузки профилей не удалась:`, error);
      
      retries--;
      
      if (retries === 0) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные пользователей"
        });
        throw error;
      }
      
      // Ждем перед следующей попыткой
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
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
    // Проверяем наличие связанных записей
    const { data: appointments } = await supabase
      .from("appointments")
      .select("id")
      .or(`parent_id.eq.${id},nanny_id.eq.${id}`)
      .limit(1);

    if (appointments && appointments.length > 0) {
      throw new Error("Невозможно удалить пользователя с активными записями");
    }

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
    
    toast({
      title: "Успешно",
      description: "Пользователь удален",
    });
  } catch (error: any) {
    console.error("Критическая ошибка при удалении пользователя:", error);
    
    let errorMessage = "Не удалось удалить пользователя";
    
    if (error.message.includes("активными записями")) {
      errorMessage = error.message;
    } else if (error.code === "23503") {
      errorMessage = "Невозможно удалить пользователя, так как есть связанные данные";
    }
    
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: errorMessage
    });
    throw error;
  }
};