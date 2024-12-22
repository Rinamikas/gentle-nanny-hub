import { useState, useEffect } from "react";
import { UserCard } from "./components/UserCard";
import { useUsers } from "./hooks/useUsers";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingScreen from "@/components/LoadingScreen";

const UsersPage = () => {
  const navigate = useNavigate();
  const { users, isLoading, error } = useUsers();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("Нет активной сессии в UsersPage");
        navigate("/auth");
      }
    };
    checkSession();
  }, [navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="p-6">Ошибка: {(error as Error).message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Управление пользователями</h1>
      <div className="grid gap-4">
        {users?.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default UsersPage;