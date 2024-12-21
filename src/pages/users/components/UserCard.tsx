import { User } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, X, Check } from "lucide-react";

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
}: UserCardProps) => {
  console.log("UserCard render:", { user, isEditing, editForm }); // Добавляем лог

  return (
    <div className="p-4 bg-white rounded-lg shadow flex items-center justify-between">
      {isEditing ? (
        <div className="flex-1 grid grid-cols-3 gap-4 mr-4">
          <Input
            value={editForm.first_name}
            onChange={(e) => {
              console.log("First name change:", e.target.value); // Лог изменения
              onFormChange("first_name", e.target.value);
            }}
            placeholder="Имя"
          />
          <Input
            value={editForm.last_name}
            onChange={(e) => {
              console.log("Last name change:", e.target.value); // Лог изменения
              onFormChange("last_name", e.target.value);
            }}
            placeholder="Фамилия"
          />
          <Input
            value={editForm.email}
            onChange={(e) => {
              console.log("Email change:", e.target.value); // Лог изменения
              onFormChange("email", e.target.value);
            }}
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
  );
};