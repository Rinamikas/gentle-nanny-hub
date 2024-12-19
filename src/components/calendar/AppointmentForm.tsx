import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { DateTimeSection } from "./appointment-form/DateTimeSection";
import { NannySelect } from "./appointment-form/NannySelect";
import { ServiceSection } from "./appointment-form/ServiceSection";
import { PromoCodeSection } from "./appointment-form/PromoCodeSection";
import { NannyAvailabilityIndicator } from "./appointment-form/NannyAvailabilityIndicator";

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedNanny?: string;
}

export function AppointmentForm({ isOpen, onClose, selectedDate, selectedNanny: initialNanny }: AppointmentFormProps) {
  console.log("AppointmentForm render:", { isOpen, selectedDate, initialNanny });
  
  const [selectedNanny, setSelectedNanny] = useState(initialNanny);
  const { toast } = useToast();
  const form = useForm();

  // Получаем текущего пользователя через useQuery
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      console.log("Загрузка сессии...");
      return await supabase.auth.getSession();
    }
  });

  const userId = session?.data?.session?.user?.id;

  // Загружаем профиль родителя
  const { data: parentProfile } = useQuery({
    queryKey: ["parent-profile", userId],
    queryFn: async () => {
      console.log("Загрузка профиля родителя...");
      
      if (!userId) return null;

      const { data, error } = await supabase
        .from("parent_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Ошибка загрузки профиля родителя:", error);
        throw error;
      }

      return data;
    },
    enabled: !!userId
  });

  const handleSubmit = async (data: any) => {
    console.log("Submitting appointment data:", data);
    // Handle appointment submission logic here
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <h2 className="text-lg font-semibold">Создание новой заявки</h2>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <DateTimeSection selectedDate={selectedDate} />
          <NannySelect selectedNanny={selectedNanny} onNannyChange={setSelectedNanny} />
          <ServiceSection />
          <PromoCodeSection />
          <NannyAvailabilityIndicator selectedNanny={selectedNanny} />
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}