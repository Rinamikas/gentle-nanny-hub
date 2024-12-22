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
import { useQuery } from "@tanstack/react-query";

interface FamilyFormProps {
  familyId?: string;
  initialData?: any;
  onSubmit?: (data: any) => void;
}

export default function FamilyForm({ familyId, initialData, onSubmit }: FamilyFormProps) {
  const { toast } = useToast();
  
  console.log("FamilyForm: начало рендера с familyId =", familyId);

  const { data: familyData, isLoading } = useQuery({
    queryKey: ['family', familyId],
    queryFn: async () => {
      console.log("FamilyForm: загрузка данных семьи для id =", familyId);
      if (!familyId) return null;

      const { data, error } = await supabase
        .from('parent_profiles')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            phone
          )
        `)
        .eq('id', familyId)
        .maybeSingle();

      if (error) {
        console.error("FamilyForm: ошибка загрузки данных семьи:", error);
        throw error;
      }

      console.log("FamilyForm: получены данные семьи:", data);
      return data;
    },
    enabled: !!familyId
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      additional_phone: "",
      address: "",
      special_requirements: "",
      notes: "",
      status: "default",
    },
  });

  useEffect(() => {
    if (familyData) {
      console.log("FamilyForm: обновляем значения формы из данных:", familyData);
      form.reset({
        first_name: familyData.profiles?.first_name || "",
        last_name: familyData.profiles?.last_name || "",
        phone: familyData.profiles?.phone || "",
        additional_phone: familyData.additional_phone || "",
        address: familyData.address || "",
        special_requirements: familyData.special_requirements || "",
        notes: familyData.notes || "",
        status: familyData.status || "default",
      });
    }
  }, [familyData, form]);

  useEffect(() => {
    console.log("FamilyForm: useEffect - установка методов формы");
    setFormMethods(form);
    return () => {
      console.log("FamilyForm: useEffect cleanup - очистка методов формы");
      setFormMethods(null);
    }
  }, [form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      console.log("FamilyForm: начало отправки формы с данными:", values);
      
      if (onSubmit) {
        onSubmit(values);
        return;
      }

      if (!familyId) {
        console.error("FamilyForm: ID семьи не определен");
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
        .eq("id", familyId);

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
        .eq("id", familyData?.profiles?.id);

      if (profileError) throw profileError;

      console.log("FamilyForm: данные успешно обновлены");
      
      toast({
        title: "Успешно",
        description: "Данные семьи обновлены",
      });
    } catch (error) {
      console.error("FamilyForm: ошибка при обновлении семьи:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить данные семьи",
      });
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 w-full max-w-2xl mx-auto p-6">
        <PersonalSection form={form} />
        <ContactSection form={form} />
        <AddressSection form={form} />
        <StatusSection form={form} />
        
        <Button type="submit" className="w-full">Сохранить</Button>

        {familyId && (
          <div className="mt-8">
            <ChildrenSection parentId={familyId} />
          </div>
        )}
      </form>
    </Form>
  );
}