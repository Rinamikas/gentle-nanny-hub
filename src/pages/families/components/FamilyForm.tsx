import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { familyFormSchema } from "../schemas/family-form-schema";
import type { FormValues } from "../types/form";
import PersonalSection from "./sections/PersonalSection";
import ContactSection from "./sections/ContactSection";
import AddressSection from "./sections/AddressSection";
import StatusSection from "./sections/StatusSection";
import ChildrenSection from "./ChildrenSection";
import { setFormMethods } from "@/utils/formTestUtils";
import { useEffect } from "react";

interface FamilyFormProps {
  initialData?: any;
  onSubmit?: (data: any) => void;
}

export default function FamilyForm({ initialData, onSubmit }: FamilyFormProps) {
  const { toast } = useToast();
  
  console.log("FamilyForm: initialData =", initialData);

  const form = useForm<FormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      first_name: initialData?.profiles?.first_name || "",
      last_name: initialData?.profiles?.last_name || "",
      phone: initialData?.profiles?.phone || "",
      additional_phone: initialData?.additional_phone || "",
      address: initialData?.address || "",
      special_requirements: initialData?.special_requirements || "",
      notes: initialData?.notes || "",
      status: initialData?.status || "default",
    },
  });

  // Устанавливаем методы формы для тестовых данных
  useEffect(() => {
    setFormMethods(form);
    return () => setFormMethods(null);
  }, [form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      if (onSubmit) {
        onSubmit(values);
        return;
      }

      if (!initialData?.id) {
        console.error("ID семьи не определен");
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "ID семьи не определен",
        });
        return;
      }

      const { error } = await supabase
        .from("parent_profiles")
        .update({
          additional_phone: values.additional_phone,
          address: values.address,
          special_requirements: values.special_requirements,
          notes: values.notes,
          status: values.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", initialData.id);

      if (error) throw error;

      // Обновляем базовый профиль
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          phone: values.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", initialData?.profiles?.id);

      if (profileError) throw profileError;

      toast({
        title: "Успешно",
        description: "Данные семьи обновлены",
      });
    } catch (error) {
      console.error("Ошибка при обновлении семьи:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить данные семьи",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <PersonalSection form={form} />
        <ContactSection form={form} />
        <AddressSection form={form} />
        <StatusSection form={form} />
        
        <Button type="submit">Сохранить</Button>
      </form>

      {initialData?.id && (
        <div className="mt-8">
          <ChildrenSection parentId={initialData.id} />
        </div>
      )}
    </Form>
  );
}