import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UserRole {
  role: string;
}

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  user_roles: UserRole[] | null;
}

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching users...");
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Ошибка аутентификации");
      }

      if (!session) {
        console.error("No active session");
        throw new Error("Пользователь не аутентифицирован");
      }

      console.log("Session found:", session);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      if (!profiles) {
        console.log("No profiles found");
        return [];
      }

      console.log("Fetched profiles:", profiles);
      return profiles as User[];
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: typeof editForm;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      toast.success("Пользователь успешно обновлен");
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Ошибка при обновлении пользователя");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Пользователь успешно удален");
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      toast.error("Ошибка при удалении пользователя");
    },
  });

  const handleEditClick = (user: any) => {
    setEditingUser(user.id);
    setEditForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
    });
  };

  const handleSaveEdit = async (id: string) => {
    updateUserMutation.mutate({ id, updates: editForm });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      deleteUserMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {(error as Error).message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Управление пользователями</h1>
      <div className="grid gap-4">
        {users?.map((user) => (
          <div
            key={user.id}
            className="p-4 bg-white rounded-lg shadow flex items-center justify-between"
          >
            {editingUser === user.id ? (
              <div className="flex-1 grid grid-cols-3 gap-4 mr-4">
                <Input
                  value={editForm.first_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, first_name: e.target.value })
                  }
                  placeholder="Имя"
                />
                <Input
                  value={editForm.last_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, last_name: e.target.value })
                  }
                  placeholder="Фамилия"
                />
                <Input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  placeholder="Email"
                />
              </div>
            ) : (
              <div>
                <h3 className="font-medium">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex gap-2 mt-1">
                  {user.user_roles?.map((role, index) => (
                    <span
                      key={`${user.id}-${role.role}-${index}`}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                    >
                      {role.role}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              {editingUser === user.id ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSaveEdit(user.id)}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingUser(null)}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(user)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
