import { useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
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
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Тип пользователя</h3>
      <div className="flex gap-4">
        <Select
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value as UserRole)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Выберите тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="parent">Родитель</SelectItem>
            <SelectItem value="nanny">Няня</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleRoleChange}
          disabled={isLoading || !selectedRole || selectedRole === currentRole}
        >
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>
    </div>
  );
}