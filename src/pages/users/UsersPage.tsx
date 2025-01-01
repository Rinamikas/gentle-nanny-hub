import { useState } from "react";
import { useUsers } from "./hooks/useUsers";
import { UserCard } from "./components/UserCard";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "@/hooks/use-toast";

const UsersPage = () => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { users, isLoading, error, changeUserRole } = useUsers();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Ошибка: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Пользователи</h1>
      <div className="space-y-4">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onRoleChange={changeUserRole}
            isSelected={selectedUsers.includes(user.id)}
            onSelect={setSelectedUsers}
          />
        ))}
      </div>
    </div>
  );
};

export default UsersPage;