import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parentFormSchema, type ParentFormValues } from "../schemas/parent-form-schema";
import ContactInfo from "./ContactInfo";
import AddressSection from "@/pages/families/components/sections/AddressSection";
import StatusSection from "@/pages/families/components/sections/StatusSection";
import ChildrenSection from "@/pages/families/components/ChildrenSection";
import type { ParentProfile } from "@/integrations/supabase/types/parent-types";

interface ParentFormProps {
  profile?: ParentProfile | null;
  onUpdate: () => void;
}

export default function ParentForm({ profile, onUpdate }: ParentFormProps) {
  const { toast } = useToast();
  const form = useForm<ParentFormValues>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      address: profile?.address || "",
      additional_phone: profile?.additional_phone || "",
      special_requirements: profile?.special_requirements || "",
      notes: profile?.notes || "",
      status: profile?.status || "default",
    },
  });

  const onSubmit = async (values: ParentFormValues) => {
    try {
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
        .eq("id", profile?.id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Анкета родителя обновлена",
      });

      onUpdate();
    } catch (error) {
      console.error("Ошибка при обновлении анкеты родителя:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить анкету родителя",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Анкета родителя</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AddressSection form={form} />
          <StatusSection form={form} />
          
          {profile?.id && (
            <div className="mt-8">
              <ChildrenSection parentId={profile.id} />
            </div>
          )}
          
          <Button type="submit">Сохранить</Button>
        </form>
      </Form>
    </div>
  );
}