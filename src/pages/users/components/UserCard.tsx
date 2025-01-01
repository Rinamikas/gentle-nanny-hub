import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "../types";
import { UserRole } from "@/integrations/supabase/types/enums";
import { Dispatch, SetStateAction } from "react";

export interface UserCardProps {
  user: User;
  onRoleChange: (userId: string, newRole: UserRole['role']) => Promise<void>;
  isSelected: boolean;
  onSelect: Dispatch<SetStateAction<string[]>>;
}

export function UserCard({ user, onRoleChange, isSelected, onSelect }: UserCardProps) {
  const handleRoleChange = async (newRole: string) => {
    await onRoleChange(user.id, newRole as UserRole['role']);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            onSelect((prev) => {
              if (checked) {
                return [...prev, user.id];
              }
              return prev.filter((id) => id !== user.id);
            });
          }}
        />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm text-gray-500">{user.main_phone}</p>
            </div>
            <Select
              value={user.user_roles[0]?.role}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Родитель</SelectItem>
                <SelectItem value="nanny">Няня</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
                <SelectItem value="owner">Владелец</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}