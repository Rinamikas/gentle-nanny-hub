import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const UsersPage = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles (
            role
          ),
          nanny_profiles (*),
          parent_profiles (*)
        `);

      if (error) throw error;
      return profiles;
    },
  });

  if (isLoading) {
    return <div>Загрузка...</div>;
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
            <div>
              <h3 className="font-medium">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex gap-2 mt-1">
                {user.user_roles?.map((role) => (
                  <span
                    key={role.role}
                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                  >
                    {role.role}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;