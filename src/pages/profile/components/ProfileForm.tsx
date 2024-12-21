import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";

const profileFormSchema = z.object({
  first_name: z.string().min(2, "Минимум 2 символа"),
  last_name: z.string().min(2, "Минимум 2 символа"),
  phone: z.string().optional(),
  email: z.string().email("Неверный формат email"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  profile: any;
  onUpdate: () => void;
}

export default function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  console.log("Rendering ProfileForm with profile:", profile);
  const { toast } = useToast();
  const { session } = useSessionContext();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone: profile?.phone || "",
      email: profile?.email || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      console.log("Submitting profile form with data:", data);

      if (!session?.user?.id) {
        throw new Error("Не авторизован");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          email: data.email,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });

      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      onUpdate();
    } catch (error: any) {
      console.error("Ошибка при обновлении профиля:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось обновить профиль",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Фамилия</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Телефон</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Сохранить изменения</Button>
      </form>
    </Form>
  );
}