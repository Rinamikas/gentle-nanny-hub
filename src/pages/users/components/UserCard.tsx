import { User } from "@/pages/users/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import UserRoleManager from "./UserRoleManager";
import { useQueryClient } from "@tanstack/react-query";

export function UserCard({ user }: { user: User }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRoleChange = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast({
      title: "Успешно",
      description: "Роль пользователя обновлена",
    });
  };

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
            {user.first_name} {user.last_name}
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </div>
        <UserRoleManager
          currentRole={user.role}
          onRoleChange={handleRoleChange}
        />
      </CardHeader>
    </Card>
  );
}
