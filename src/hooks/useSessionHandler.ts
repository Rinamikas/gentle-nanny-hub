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
      
      // Очищаем localStorage
      localStorage.clear();
      console.log("Локальное хранилище очищено");
      
      try {
        // Пробуем выйти через Supabase
        await supabase.auth.signOut();
        console.log("Выход через Supabase выполнен");
      } catch (error) {
        // Даже если выход через Supabase не удался, продолжаем
        console.warn("Ошибка при выходе через Supabase:", error);
      }
      
      console.log("Выход успешно выполнен");
      toast({
        title: "Успешно",
        description: "Вы вышли из системы",
      });
      
      // В любом случае перенаправляем на страницу входа
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