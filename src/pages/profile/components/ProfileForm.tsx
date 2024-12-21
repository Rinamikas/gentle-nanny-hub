import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useEffect } from "react";

const profileFormSchema = z.object({
  first_name: z.string().min(2, "Минимум 2 символа"),
  last_name: z.string().min(2, "Минимум 2 символа"),
  phone: z.string().optional(),
  email: z.string().email("Неверный формат email"),
});

type FormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm({ profile, onUpdate }: { profile: any, onUpdate: () => void }) {
  const { session } = useSessionContext();
  const form = useForm<FormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        email: profile.email || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: FormValues) => {
    try {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalSection form={form} />
        <ContactSection form={form} />
        <Button type="submit">Сохранить изменения</Button>
      </form>
    </Form>
  );
}

function PersonalSection({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="first_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Имя</FormLabel>
            <FormControl>
              <Input placeholder="Введите имя" {...field} />
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
              <Input placeholder="Введите фамилию" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function ContactSection({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Телефон</FormLabel>
            <FormControl>
              <Input placeholder="+7 (999) 999-99-99" {...field} />
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
              <Input placeholder="example@mail.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}