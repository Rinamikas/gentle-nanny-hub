import { useState } from "react";
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

export function AppointmentForm({ isOpen, onClose, selectedDate: initialDate, selectedNanny: initialNanny }: AppointmentFormProps) {
  console.log("AppointmentForm render:", { isOpen, initialDate, initialNanny });
  
  // Состояния формы
  const [selectedNanny, setSelectedNanny] = useState(initialNanny);
  const [selectedService, setSelectedService] = useState<string>();
  const [promoCode, setPromoCode] = useState("");
  const [dateTimeEntries, setDateTimeEntries] = useState<Array<{ date: Date; startTime: string; endTime: string; }>>([
    { date: initialDate || new Date(), startTime: "09:00", endTime: "11:00" }
  ]);
  
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

  const handlePromoCodeCheck = (discountPercent: number) => {
    console.log("Проверка промокода, скидка:", discountPercent);
    toast({
      title: "Промокод применен",
      description: `Скидка ${discountPercent}% будет применена к заказу`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <h2 className="text-lg font-semibold">Создание новой заявки</h2>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <DateTimeSection 
            entries={dateTimeEntries}
            onEntriesChange={setDateTimeEntries}
          />
          <NannySelect 
            value={selectedNanny} 
            onSelect={setSelectedNanny}
            selectedDates={dateTimeEntries}
          />
          <ServiceSection 
            selectedService={selectedService}
            setSelectedService={setSelectedService}
          />
          <PromoCodeSection 
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            onPromoCodeCheck={handlePromoCodeCheck}
          />
          <NannyAvailabilityIndicator 
            status={selectedNanny ? "available" : "unavailable"}
          />
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}