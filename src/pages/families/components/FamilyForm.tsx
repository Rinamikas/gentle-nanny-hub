import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { familyFormSchema } from "../schemas/family-form-schema";
import type { FormValues } from "../types/form";

export default function FamilyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      additional_phone: "",
      address: "",
      status: "default",
      notes: "",
    },
  });

  useEffect(() => {
    const loadFamilyData = async () => {
      if (!id) return;

      try {
        const { data: parentProfile, error: parentProfileError } = await supabase
          .from("parent_profiles")
          .select(`
            *,
            profiles (
              first_name,
              last_name,
              phone
            )
          `)
          .eq("id", id)
          .single();

        if (parentProfileError) throw parentProfileError;

        if (parentProfile) {
          form.reset({
            first_name: parentProfile.profiles?.first_name || "",
            last_name: parentProfile.profiles?.last_name || "",
            phone: parentProfile.profiles?.phone || "",
            additional_phone: parentProfile.additional_phone || "",
            address: parentProfile.address || "",
            status: parentProfile.status || "default",
            notes: parentProfile.notes || "",
          });
        }
      } catch (error) {
        console.error("Error loading family data:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные семьи",
        });
      }
    };

    loadFamilyData();
  }, [id, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      console.log("Сохранение данных семьи...", data);

      // Создаем или обновляем профиль семьи
      const { data: parentProfile, error: parentProfileError } = await supabase
        .from("parent_profiles")
        .upsert({
          id: id || undefined,
          address: data.address,
          status: data.status,
          additional_phone: data.additional_phone,
          notes: data.notes,
        })
        .select()
        .single();

      if (parentProfileError) {
        console.error("Ошибка сохранения профиля семьи:", parentProfileError);
        throw parentProfileError;
      }

      console.log("Профиль семьи сохранен:", parentProfile);

      // Обновляем профиль в таблице profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: parentProfile.user_id,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
        });

      if (profileError) {
        console.error("Ошибка обновления основного профиля:", profileError);
        throw profileError;
      }

      toast({
        title: "Успешно",
        description: "Данные семьи сохранены",
      });

      navigate("/families");
    } catch (error: any) {
      console.error("Ошибка при сохранении:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось сохранить данные",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        {id ? "Редактирование семьи" : "Добавление новой семьи"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              name="additional_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дополнительный телефон</FormLabel>
                  <FormControl>
                    <Input placeholder="+7 (999) 999-99-99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Адрес</FormLabel>
                <FormControl>
                  <Input placeholder="Введите адрес" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Статус</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="default">Обычный</SelectItem>
                    <SelectItem value="star">Звездный</SelectItem>
                    <SelectItem value="diamond">Бриллиантовый</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Заметки</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Введите дополнительную информацию"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/families")}
            >
              Отмена
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}