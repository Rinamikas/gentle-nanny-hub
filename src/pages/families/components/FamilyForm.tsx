import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { familyFormSchema } from "../schemas/family-form-schema";
import type { FormValues } from "../types/form";
import PersonalSection from "./sections/PersonalSection";
import ContactSection from "./sections/ContactSection";
import AddressSection from "./sections/AddressSection";
import StatusSection from "./sections/StatusSection";
import { setFormMethods } from "@/utils/formTestUtils";
import { useSessionContext } from "@supabase/auth-helpers-react";

export default function FamilyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useSessionContext();

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
    setFormMethods(form);
  }, [form]);

  useEffect(() => {
    const loadFamilyData = async () => {
      if (!id) return;

      try {
        console.log("Загрузка данных семьи...");
        const { data: parentProfile, error: parentProfileError } = await supabase
          .from("parent_profiles")
          .select(`
            *,
            profiles (
              id,
              first_name,
              last_name,
              main_phone
            )
          `)
          .eq("id", id)
          .single();

        if (parentProfileError) {
          console.error("Ошибка загрузки данных семьи:", parentProfileError);
          throw parentProfileError;
        }

        console.log("Загруженные данные:", parentProfile);

        if (parentProfile) {
          form.reset({
            first_name: parentProfile.profiles?.first_name || "",
            last_name: parentProfile.profiles?.last_name || "",
            phone: parentProfile.profiles?.main_phone || "",
            additional_phone: parentProfile.additional_phone || "",
            address: parentProfile.address || "",
            status: parentProfile.status || "default",
            notes: parentProfile.notes || "",
          });
        }
      } catch (error) {
        console.error("Ошибка загрузки данных семьи:", error);
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
    if (!session?.user?.id) {
      console.error("Пользователь не авторизован");
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Необходимо авторизоваться",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Сохранение данных семьи...", data);

      // Создаем или обновляем профиль
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
        })
        .select()
        .single();

      if (profileError) {
        console.error("Ошибка сохранения профиля:", profileError);
        throw profileError;
      }

      console.log("Профиль сохранен:", profileData);

      // Создаем или обновляем профиль семьи
      const { data: parentProfile, error: parentProfileError } = await supabase
        .from("parent_profiles")
        .upsert({
          id: id || undefined,
          user_id: session.user.id,
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
          <PersonalSection form={form} />
          <ContactSection form={form} />
          <AddressSection form={form} />
          <StatusSection form={form} />

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
