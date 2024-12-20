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
      console.log("=== Начало процесса выхода ===");
      
      // Сначала очищаем localStorage
      localStorage.clear();
      console.log("1. Локальное хранилище очищено");
      
      try {
        // Пробуем выйти через Supabase
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn("2. Ошибка при выходе через Supabase:", error);
        } else {
          console.log("2. Выход через Supabase выполнен успешно");
        }
      } catch (error) {
        console.warn("2. Ошибка при выходе через Supabase:", error);
      }
      
      console.log("3. Показываем уведомление об успешном выходе");
      toast({
        title: "Успешно",
        description: "Вы вышли из системы",
      });
      
      console.log("4. Перенаправляем на страницу авторизации");
      navigate("/auth", { replace: true });
      
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

  // Обработчик ошибок сессии
  const handleSessionError = () => {
    console.log("=== Обработка ошибки сессии ===");
    handleLogout();
  };

  // Слушатель изменения состояния аутентификации
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("Изменение состояния аутентификации:", event);
    
    if (event === 'TOKEN_REFRESHED') {
      console.log("Токен успешно обновлен");
    }
    
    if (event === 'SIGNED_OUT') {
      console.log("Пользователь вышел из системы");
      navigate('/auth', { replace: true });
    }

    // Если возникла ошибка с токеном
    if (!session && (
      event === 'TOKEN_REFRESHED' || 
      event === 'INITIAL_SESSION'
    )) {
      console.error("Ошибка обновления токена или начальной сессии");
      handleSessionError();
    }
  });

  return {
    handleLogout,
    handleSessionError,
    isLoading
  };
};