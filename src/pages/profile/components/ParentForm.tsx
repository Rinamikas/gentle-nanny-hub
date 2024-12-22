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

type ParentStatus = Database['public']['Enums']['parent_status'];

interface ParentFormProps {
  profile: Profile;
  onUpdate: () => void;
}

export default function ParentForm({ profile, onUpdate }: ParentFormProps) {
  const { toast } = useToast();

  // Получаем данные профиля родителя
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
      additional_phone: parentProfile?.additional_phone || "",
      special_requirements: parentProfile?.special_requirements || "",
      notes: parentProfile?.notes || "",
      status: (parentProfile?.status as ParentStatus) || "default",
    },
  });

  const onSubmit = async (values: ParentFormValues) => {
    try {
      if (!parentProfile?.id) {
        console.log("Создание нового профиля родителя");
        const { error: createError } = await supabase
          .from("parent_profiles")
          .insert({
            user_id: profile.id,
            address: values.address,
            additional_phone: values.additional_phone,
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
            additional_phone: values.additional_phone,
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
          
          <Button type="submit">Сохранить</Button>
        </form>
      </Form>
    </div>
  );
}