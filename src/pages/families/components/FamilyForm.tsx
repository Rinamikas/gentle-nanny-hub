import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { FormValues } from "../types/form";
import PersonalSection from "./sections/PersonalSection";
import ContactSection from "./sections/ContactSection";
import AddressSection from "./sections/AddressSection";
import StatusSection from "./sections/StatusSection";
import ChildrenSection from "./ChildrenSection";
import { setFormMethods } from "@/utils/formTestUtils";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFamilyData } from "../hooks/useFamilyData";
import { useFamilyForm } from "../hooks/useFamilyForm";

interface FamilyFormProps {
  familyId?: string;
  initialData?: any;
  onSubmit?: (data: any) => void;
}

export default function FamilyForm({ familyId: propsFamilyId, initialData, onSubmit }: FamilyFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id: routeFamilyId } = useParams();
  
  const currentFamilyId = propsFamilyId || routeFamilyId;
  
  console.log("FamilyForm: начало рендера с familyId =", currentFamilyId);

  const { data: familyData, isLoading } = useFamilyData(currentFamilyId);
  const form = useFamilyForm(familyData);

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

      if (currentFamilyId) {
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
          .eq("id", currentFamilyId);

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
        
        navigate("/families");
      } else {
        // Создание новой семьи
        console.log("FamilyForm: создание новой семьи");

        // Создаем пользователя в auth.users через API, но без автоматического входа
        const { data: authData, error: authError } = await supabase.functions.invoke(
          'create-auth-user',
          {
            body: JSON.stringify({ 
              email: values.email,
              code: Math.random().toString(36).slice(-8), // Временный пароль
              shouldSignIn: false // Важно! Не выполняем автоматический вход
            })
          }
        );

        if (authError) throw authError;

        if (!authData.id) {
          throw new Error("Не удалось создать пользователя");
        }

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
          .eq("id", authData.id);

        if (profileError) throw profileError;

        // Создаем профиль родителя
        const { data: parentProfile, error: parentCreateError } = await supabase
          .from("parent_profiles")
          .insert({
            user_id: authData.id,
            additional_phone: values.additional_phone,
            address: values.address,
            special_requirements: values.special_requirements,
            notes: values.notes,
            status: values.status,
          })
          .select()
          .single();

        if (parentCreateError) throw parentCreateError;

        console.log("FamilyForm: семья успешно создана:", parentProfile);
        
        toast({
          title: "Успешно",
          description: "Новая семья создана",
        });

        navigate("/families");
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

        {currentFamilyId && familyData?.id && (
          <div className="mt-8">
            <ChildrenSection parentId={familyData.id} />
          </div>
        )}
      </form>
    </Form>
  );
}