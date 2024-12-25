import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parentFormSchema, type ParentFormValues } from "../schemas/parent-form-schema";
import AddressSection from "@/pages/families/components/sections/AddressSection";
import StatusSection from "@/pages/families/components/sections/StatusSection";
import ChildrenSection from "@/pages/families/components/ChildrenSection";
import type { Database } from "@/integrations/supabase/types";
import type { Profile } from "../types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { setFormMethods, fillFormWithTestData } from "@/utils/formTestUtils";
import { Beaker, AlertTriangle } from "lucide-react";

type ParentStatus = Database['public']['Enums']['parent_status'];

interface ParentFormProps {
  profile: Profile;
  onUpdate: () => void;
}

export default function ParentForm({ profile, onUpdate }: ParentFormProps) {
  const { toast } = useToast();

  const { data: parentProfile, isLoading } = useQuery({
    queryKey: ['parentProfile', profile.id],
    queryFn: async () => {
      console.log("Загрузка профиля родителя для пользователя:", profile.id);
      
      const { data, error } = await supabase
        .from('parent_profiles')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) {
        console.error("Ошибка при загрузке профиля родителя:", error);
        throw error;
      }

      console.log("Загружен профиль родителя:", data);
      return data;
    },
    enabled: !!profile.id
  });

  const form = useForm<ParentFormValues>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      address: parentProfile?.address || "",
      emergency_phone: parentProfile?.emergency_phone || "",
      special_requirements: parentProfile?.special_requirements || "",
      notes: parentProfile?.notes || "",
      status: (parentProfile?.status as ParentStatus) || "default",
    },
  });

  useEffect(() => {
    setFormMethods(form);
    return () => setFormMethods(null);
  }, [form]);

  const handleFillValidData = () => {
    console.log("Заполняем валидными тестовыми данными");
    try {
      fillFormWithTestData(true);
    } catch (error) {
      console.error("Ошибка при заполнении тестовыми данными:", error);
    }
  };

  const handleFillInvalidData = () => {
    console.log("Заполняем невалидными тестовыми данными");
    try {
      fillFormWithTestData(false);
    } catch (error) {
      console.error("Ошибка при заполнении ошибочными данными:", error);
    }
  };

  const onSubmit = async (values: ParentFormValues) => {
    try {
      if (!parentProfile?.id) {
        console.log("Создание нового профиля родителя");
        const { error: createError } = await supabase
          .from("parent_profiles")
          .insert({
            user_id: profile.id,
            address: values.address,
            emergency_phone: values.emergency_phone,
            special_requirements: values.special_requirements,
            notes: values.notes,
            status: values.status,
          });

        if (createError) throw createError;

        toast({
          title: "Успешно",
          description: "Анкета родителя создана",
        });
      } else {
        console.log("Обновление профиля родителя:", parentProfile.id);
        const { error } = await supabase
          .from("parent_profiles")
          .update({
            address: values.address,
            emergency_phone: values.emergency_phone,
            special_requirements: values.special_requirements,
            notes: values.notes,
            status: values.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", parentProfile.id);

        if (error) throw error;

        toast({
          title: "Успешно",
          description: "Анкета родителя обновлена",
        });
      }

      onUpdate();
    } catch (error) {
      console.error("Ошибка при сохранении анкеты родителя:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить анкету родителя",
      });
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Анкета родителя</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AddressSection form={form} />
          <StatusSection form={form} />
          
          {parentProfile?.id && (
            <div className="mt-8">
              <ChildrenSection parentId={parentProfile.id} />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button type="submit">Сохранить</Button>
            
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={handleFillValidData}
            >
              <Beaker className="h-4 w-4" />
              Тестовые данные
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="gap-2 text-destructive"
              onClick={handleFillInvalidData}
            >
              <AlertTriangle className="h-4 w-4" />
              Ошибочные данные
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}