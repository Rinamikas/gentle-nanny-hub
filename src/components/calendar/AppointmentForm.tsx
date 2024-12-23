import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AppointmentFormContent } from "./appointment-form/AppointmentFormContent";

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedNanny?: string;
}

export function AppointmentForm({ isOpen, onClose, selectedDate: initialDate, selectedNanny: initialNanny }: AppointmentFormProps) {
  console.log("AppointmentForm render:", { isOpen, initialDate, initialNanny });
  
  const [selectedNanny, setSelectedNanny] = useState(initialNanny || '');
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [promoCode, setPromoCode] = useState("");
  const [dateTimeEntries, setDateTimeEntries] = useState<Array<{ date: Date; startTime: string; endTime: string; }>>([
    { date: initialDate || new Date(), startTime: "09:00", endTime: "11:00" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      console.log("Загрузка сессии...");
      return await supabase.auth.getSession();
    }
  });

  const userId = session?.data?.session?.user?.id;

  const handleSubmit = async () => {
    console.log("Submitting appointment with data:", {
      selectedNanny,
      selectedParent,
      selectedService,
      promoCode,
      dateTimeEntries
    });

    if (!selectedNanny || selectedNanny === '') {
      toast({
        title: "Ошибка",
        description: "Выберите няню",
        variant: "destructive",
      });
      return;
    }

    if (!selectedParent || selectedParent === '') {
      toast({
        title: "Ошибка",
        description: "Выберите семью",
        variant: "destructive",
      });
      return;
    }

    if (!selectedService || selectedService === '') {
      toast({
        title: "Ошибка", 
        description: "Выберите услугу",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Создаем заявки для каждого выбранного времени
      for (const entry of dateTimeEntries) {
        const [startHours, startMinutes] = entry.startTime.split(':').map(Number);
        const [endHours, endMinutes] = entry.endTime.split(':').map(Number);

        // Создаем дату начала в UTC
        const startDateTime = new Date(Date.UTC(
          entry.date.getFullYear(),
          entry.date.getMonth(),
          entry.date.getDate(),
          startHours - 3, // Компенсируем часовой пояс Москвы (UTC+3)
          startMinutes
        ));

        // Создаем дату окончания в UTC
        const endDateTime = new Date(Date.UTC(
          entry.date.getFullYear(),
          entry.date.getMonth(),
          entry.date.getDate(),
          endHours - 3, // Компенсируем часовой пояс Москвы (UTC+3)
          endMinutes
        ));

        console.log("Создание заявки:", {
          nanny_id: selectedNanny,
          parent_id: selectedParent,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          service_id: selectedService,
        });

        const { error } = await supabase
          .from('appointments')
          .insert({
            nanny_id: selectedNanny,
            parent_id: selectedParent,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            service_id: selectedService,
            status: 'pending'
          });

        if (error) {
          console.error("Ошибка создания заявки:", error);
          throw new Error(error.message);
        }
      }

      toast({
        title: "Успешно",
        description: "Заявка создана",
      });
      
      onClose();
    } catch (error) {
      console.error("Ошибка при сохранении заявки:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать заявку",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle>Создание новой заявки</DialogTitle>
        <DialogDescription>
          Заполните форму для создания новой заявки на услуги няни
        </DialogDescription>
        <AppointmentFormContent
          dateTimeEntries={dateTimeEntries}
          onDateTimeEntriesChange={setDateTimeEntries}
          selectedNanny={selectedNanny}
          onNannySelect={setSelectedNanny}
          selectedParent={selectedParent}
          onParentSelect={setSelectedParent}
          selectedService={selectedService}
          onServiceSelect={setSelectedService}
          promoCode={promoCode}
          onPromoCodeChange={setPromoCode}
          onPromoCodeCheck={handlePromoCodeCheck}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}