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
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type ParentProfile = Database['public']['Tables']['parent_profiles']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ParentProfileWithUser extends ParentProfile {
  profiles: Profile;
}

interface FamilyFormProps {
  familyId?: string;
  initialData?: any;
  onSubmit?: (data: any) => void;
}

export default function FamilyForm({ familyId, initialData, onSubmit }: FamilyFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  console.log("FamilyForm: начало рендера с familyId =", familyId);

  const { data: familyData, isLoading } = useQuery({
    queryKey: ['family', familyId],
    queryFn: async () => {
      console.log("FamilyForm: загрузка данных семьи для id =", familyId);
      if (!familyId) return null;

      const { data: parentProfile, error: parentError } = await supabase
        .from('parent_profiles')
        .select('*')
        .eq('id', familyId)
        .maybeSingle();

      if (parentError) {
        console.error("FamilyForm: ошибка загрузки parent_profile:", parentError);
        throw parentError;
      }

      if (!parentProfile) {
        console.error("FamilyForm: parent_profile не найден");
        return null;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', parentProfile.user_id)
        .maybeSingle();

      if (profileError) {
        console.error("FamilyForm: ошибка загрузки profile:", profileError);
        throw profileError;
      }

      if (!profile) {
        console.error("FamilyForm: profile не найден");
        return null;
      }

      const result: ParentProfileWithUser = {
        ...parentProfile,
        profiles: profile
      };

      console.log("FamilyForm: получены данные семьи:", result);
      return result;
    },
    enabled: !!familyId
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
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
        email: familyData.profiles?.email || "",
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

      if (familyId) {
        // Обновление существующей семьи
        const { error: parentError } = await supabase
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

        if (parentError) throw parentError;

        // Обновляем базовый профиль
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
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
      } else {
        // Создание новой семьи
        console.log("FamilyForm: создание новой семьи");

        // Создаем пользователя в auth.users через API
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: Math.random().toString(36).slice(-8), // Временный пароль
        });

        if (authError) throw authError;

        if (!authData.user) {
          throw new Error("Не удалось создать пользователя");
        }

        // Триггер handle_new_user() автоматически создаст записи в profiles и parent_profiles
        // Нам нужно только обновить созданные записи

        // Ждем немного, чтобы триггер успел отработать
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Обновляем базовый профиль
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            first_name: values.first_name,
            last_name: values.last_name,
            phone: values.phone,
          })
          .eq("id", authData.user.id);

        if (profileError) throw profileError;

        // Получаем ID созданного профиля родителя
        const { data: parentProfile, error: parentFetchError } = await supabase
          .from("parent_profiles")
          .select("id")
          .eq("user_id", authData.user.id)
          .single();

        if (parentFetchError) throw parentFetchError;

        // Обновляем профиль родителя
        const { error: parentUpdateError } = await supabase
          .from("parent_profiles")
          .update({
            additional_phone: values.additional_phone,
            address: values.address,
            special_requirements: values.special_requirements,
            notes: values.notes,
            status: values.status,
          })
          .eq("id", parentProfile.id);

        if (parentUpdateError) throw parentUpdateError;

        console.log("FamilyForm: семья успешно создана:", parentProfile);
        
        toast({
          title: "Успешно",
          description: "Новая семья создана",
        });

        // Перенаправляем на страницу редактирования
        navigate(`/families/${parentProfile.id}/edit`);
      }
    } catch (error) {
      console.error("FamilyForm: ошибка при сохранении семьи:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить данные семьи",
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