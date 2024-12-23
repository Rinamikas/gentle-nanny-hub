import { useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { AlertOctagon, UserCog } from "lucide-react";
import type { UserRole } from "@/pages/users/types";

interface UserRoleManagerProps {
  currentRole?: string;
  onRoleChange: () => void;
}

export default function UserRoleManager({ currentRole, onRoleChange }: UserRoleManagerProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(
    currentRole as UserRole | undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { session } = useSessionContext();
  const { toast } = useToast();

  const handleRoleChange = async () => {
    if (!session?.user?.id || !selectedRole || selectedRole === currentRole) return;

    try {
      setIsLoading(true);
      console.log("Начинаем смену роли...", { currentRole, selectedRole });

      // 1. Удаляем старую роль
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", session.user.id);

      if (deleteError) {
        console.error("Ошибка при удалении старой роли:", deleteError);
        throw deleteError;
      }

      // 2. Если был родителем - удаляем профиль родителя
      if (currentRole === "parent") {
        const { error: deleteParentError } = await supabase
          .from("parent_profiles")
          .delete()
          .eq("user_id", session.user.id);

        if (deleteParentError) {
          console.error("Ошибка при удалении профиля родителя:", deleteParentError);
          throw deleteParentError;
        }
      }

      // 3. Если была няней - удаляем профиль няни
      if (currentRole === "nanny") {
        const { error: deleteNannyError } = await supabase
          .from("nanny_profiles")
          .delete()
          .eq("user_id", session.user.id);

        if (deleteNannyError) {
          console.error("Ошибка при удалении профиля няни:", deleteNannyError);
          throw deleteNannyError;
        }
      }

      // 4. Добавляем новую роль
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({
          user_id: session.user.id,
          role: selectedRole,
        });

      if (insertError) {
        console.error("Ошибка при добавлении новой роли:", insertError);
        throw insertError;
      }

      // 5. Если выбран родитель - создаем профиль родителя
      if (selectedRole === "parent") {
        const { error: createParentError } = await supabase
          .from("parent_profiles")
          .insert({
            user_id: session.user.id,
          });

        if (createParentError) {
          console.error("Ошибка при создании профиля родителя:", createParentError);
          throw createParentError;
        }
      }

      // 6. Если выбрана няня - создаем профиль няни
      if (selectedRole === "nanny") {
        const { error: createNannyError } = await supabase
          .from("nanny_profiles")
          .insert({
            user_id: session.user.id,
          });

        if (createNannyError) {
          console.error("Ошибка при создании профиля няни:", createNannyError);
          throw createNannyError;
        }
      }

      toast({
        title: "Успешно",
        description: "Тип пользователя изменен",
      });

      setIsOpen(false);
      onRoleChange();
    } catch (error) {
      console.error("Ошибка при смене роли:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось изменить тип пользователя",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <UserCog className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-yellow-500" />
            Смена роли пользователя
          </DialogTitle>
          <DialogDescription className="text-yellow-600">
            Внимание! Смена роли приведет к удалению всех данных, связанных с текущей ролью.
            Это действие необратимо.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Выберите новую роль:</label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <SelectTrigger>
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
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleRoleChange}
              disabled={isLoading || !selectedRole || selectedRole === currentRole}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {isLoading ? "Сохранение..." : "Подтвердить смену роли"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}