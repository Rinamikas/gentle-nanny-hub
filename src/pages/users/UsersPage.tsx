import { useState } from "react";
import { useUsers } from "./hooks/useUsers";
import UserCard from "./components/UserCard";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "@/hooks/use-toast";
import type { UserRole } from "./types";

const UsersPage = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { users, isLoading, error, updateUser, deleteUser, changeUserRole } = useUsers();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleRoleChange = async (userId: string, newRole: UserRole['role']) => {
    try {
      await changeUserRole(userId, newRole);
    } catch (error) {
      console.error("Error changing role:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить роль пользователя",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Пользователи</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onUpdate={updateUser}
            onDelete={deleteUser}
            onRoleChange={handleRoleChange}
            isSelected={selectedUserId === user.id}
            onSelect={setSelectedUserId}
          />
        ))}
      </div>
    </div>
  );
};

export default UsersPage;