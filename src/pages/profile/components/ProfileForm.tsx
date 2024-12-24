import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { profileFormSchema, type ProfileFormValues } from "../schemas/profile-form-schema";
import type { Profile } from "../types";
import ContactInfo from "./ContactInfo";
import UserRoleManager from "./UserRoleManager";
import { localizeUserRole } from "@/utils/localization";

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
      main_phone: profile?.main_phone || "",
      email: profile?.email || "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      console.log("Обновление профиля с данными:", values);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          main_phone: values.main_phone,
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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Профиль пользователя</h2>
        <div className="flex items-center gap-2">
          {profile?.user_roles?.[0]?.role && (
            <span className="text-sm text-gray-500">
              {localizeUserRole(profile.user_roles[0].role)}
            </span>
          )}
          <UserRoleManager 
            currentRole={profile?.user_roles?.[0]?.role} 
            onRoleChange={onUpdate} 
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={() => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      value={profile?.email || ''} 
                      readOnly 
                      className="bg-gray-50"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <ContactInfo form={form} />
          </div>
          <Button type="submit">Сохранить</Button>
        </form>
      </Form>
    </div>
  );
}