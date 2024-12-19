import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useSessionHandler = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      console.log("Начинаем процесс выхода...");
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("Сессия уже не активна, перенаправляем на страницу входа");
        navigate("/auth");
        return;
      }

      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) {
        console.error("Ошибка при выходе:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось выйти из системы",
        });
        return;
      }

      console.log("Выход успешно выполнен");
      toast({
        title: "Успешно",
        description: "Вы вышли из системы",
      });
      
      navigate("/auth");
    } catch (error) {
      console.error("Неожиданная ошибка при выходе:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла неожиданная ошибка",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Добавляем обработчик ошибок сессии
  const handleSessionError = () => {
    console.log("Обнаружена ошибка сессии, выполняем выход...");
    handleLogout();
  };

  // Устанавливаем слушатель изменения состояния аутентификации
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("Изменение состояния аутентификации:", event);
    
    if (event === 'TOKEN_REFRESHED') {
      console.log("Токен успешно обновлен");
    }
    
    if (event === 'SIGNED_OUT') {
      console.log("Пользователь вышел");
      navigate('/auth');
    }

    // Если возникла ошибка с токеном
    if (!session && event === 'TOKEN_REFRESHED') {
      console.error("Ошибка обновления токена");
      handleSessionError();
    }
  });

  return {
    handleLogout,
    handleSessionError,
    isLoading
  };
};