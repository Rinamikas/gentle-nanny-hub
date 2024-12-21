import { useState, useEffect } from "react";
import { UserCard } from "./components/UserCard";
import { useUsers } from "./hooks/useUsers";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingScreen from "@/components/LoadingScreen";

const UsersPage = () => {
  const navigate = useNavigate();
  const { users, isLoading, error, updateUser, deleteUser } = useUsers();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

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

  const handleEditClick = (user: any) => {
    setEditingUser(user.id);
    setEditForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
    });
  };

  const handleSaveEdit = async (id: string) => {
    updateUser({ 
      id, 
      updates: editForm 
    });
    setEditingUser(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      deleteUser(id);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

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
          <UserCard
            key={user.id}
            user={user}
            isEditing={editingUser === user.id}
            editForm={editForm}
            onEdit={() => handleEditClick(user)}
            onSave={() => handleSaveEdit(user.id)}
            onCancel={() => setEditingUser(null)}
            onDelete={() => handleDelete(user.id)}
            onFormChange={handleFormChange}
          />
        ))}
      </div>
    </div>
  );
};

export default UsersPage;