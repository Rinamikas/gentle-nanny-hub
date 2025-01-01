import { User } from "@/integrations/supabase/types/user-types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRole } from "@/integrations/supabase/types/user-types";

interface UserCardProps {
  user: User;
  onRoleChange: (userId: string, newRole: UserRole) => Promise<void>;
  isSelected: boolean;
  onSelect: (userId: string) => void;
}

export function UserCard({ user, onRoleChange, isSelected, onSelect }: UserCardProps) {
  const handleRoleChange = async (newRole: UserRole) => {
    await onRoleChange(user.id, newRole);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(user.id)}
          aria-label="Select user"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm text-gray-500">{user.main_phone}</p>
            </div>
            <div className="flex gap-2">
              {user.user_roles.map((userRole, index) => (
                <Badge key={index} variant="secondary">
                  {userRole}
                </Badge>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoleChange('parent')}
              disabled={user.user_roles.includes('parent')}
            >
              Родитель
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoleChange('nanny')}
              disabled={user.user_roles.includes('nanny')}
            >
              Няня
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoleChange('admin')}
              disabled={user.user_roles.includes('admin')}
            >
              Админ
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}