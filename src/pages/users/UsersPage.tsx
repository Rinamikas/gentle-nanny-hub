import { useState } from "react";
import { useUsers } from "./hooks/useUsers";
import { UserCard } from "./components/UserCard";
import LoadingScreen from "@/components/LoadingScreen";

export default function UsersPage() {
  const { users, isLoading, error, changeUserRole } = useUsers();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Пользователи</h1>
      <div className="space-y-4">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onRoleChange={changeUserRole}
            isSelected={selectedUsers.includes(user.id)}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}