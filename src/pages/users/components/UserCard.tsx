import { User } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { useState } from "react";

interface UserCardProps {
  user: User;
  isEditing: boolean;
  editForm: {
    first_name: string;
    last_name: string;
    email: string;
  };
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onFormChange: (field: string, value: string) => void;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
}

export const UserCard = ({
  user,
  isEditing,
  editForm,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onFormChange,
  onRoleChange,
}: UserCardProps) => {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const currentRole = user.user_roles?.[0]?.role || "";

  const handleRoleChange = async () => {
    if (newRole && newRole !== currentRole) {
      await onRoleChange(user.id, newRole);
      setShowRoleDialog(false);
      setNewRole("");
    }
  };

  return (
    <>
      <div className="p-4 bg-white rounded-lg shadow flex items-center justify-between">
        {isEditing ? (
          <div className="flex-1 grid grid-cols-3 gap-4 mr-4">
            <Input
              value={editForm.first_name}
              onChange={(e) => onFormChange("first_name", e.target.value)}
              placeholder="Имя"
            />
            <Input
              value={editForm.last_name}
              onChange={(e) => onFormChange("last_name", e.target.value)}
              placeholder="Фамилия"
            />
            <Input
              value={editForm.email}
              onChange={(e) => onFormChange("email", e.target.value)}
              placeholder="Email"
            />
          </div>
        ) : (
          <div className="flex-1">
            <h3 className="font-medium">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex gap-2">
                {user.user_roles?.map((role, index) => (
                  <span
                    key={`${user.id}-${role.role}-${index}`}
                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                  >
                    {role.role}
                  </span>
                ))}
              </div>
              <Select
                value={newRole}
                onValueChange={(value) => {
                  setNewRole(value);
                  setShowRoleDialog(true);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Изменить роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Родитель</SelectItem>
                  <SelectItem value="nanny">Няня</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" size="icon" onClick={onSave}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изменение роли пользователя</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите изменить роль пользователя с "{currentRole}" на "{newRole}"?
              Это действие приведет к созданию нового профиля и мягкому удалению старого.
              Все связанные данные будут сохранены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewRole("")}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange}>Подтвердить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};