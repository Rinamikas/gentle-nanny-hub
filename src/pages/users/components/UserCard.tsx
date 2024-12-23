import { useState } from "react";
import { User } from "@/pages/users/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import UserRoleManager from "./UserRoleManager";
import DeleteUserDialog from "./DeleteUserDialog";
import { useQueryClient } from "@tanstack/react-query";
import { deleteUserProfile } from "../api/userApi";

export function UserCard({ user }: { user: User }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRoleChange = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast({
      title: "Успешно",
      description: "Роль пользователя обновлена",
    });
  };

  const handleDelete = async () => {
    try {
      await deleteUserProfile(user.id);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Ошибка при удалении пользователя:", error);
    }
  };

  const displayName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user.email;

  return (
    <Card className="w-full">
      <CardHeader className="flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.photo_url || undefined} />
          <AvatarFallback>
            {user.first_name?.[0]}
            {user.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">
            {displayName}
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <UserRoleManager
            currentRole={user.user_roles?.[0]?.role}
            onRoleChange={handleRoleChange}
          />
        </div>
      </CardHeader>

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        userName={displayName}
      />
    </Card>
  );
}