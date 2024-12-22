import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { profileFormSchema, type ProfileFormValues } from "../schemas/profile-form-schema";
import type { Profile } from "../types";
import ContactInfo from "./ContactInfo";
import UserRoleManager from "./UserRoleManager";

interface ProfileFormProps {
  profile?: Profile | null;
  onUpdate: () => void;
}

export default function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const { toast } = useToast();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone: profile?.phone || "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          phone: values.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile?.id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Профиль обновлен",
      });

      onUpdate();
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить профиль",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ContactInfo form={form} />
          <Button type="submit">Сохранить</Button>
        </form>
      </Form>

      <div className="border-t pt-6">
        <UserRoleManager 
          currentRole={profile?.user_roles?.[0]?.role} 
          onRoleChange={onUpdate} 
        />
      </div>
    </div>
  );
}