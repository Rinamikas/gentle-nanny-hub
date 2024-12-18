import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DateTimeSection } from "./appointment-form/DateTimeSection";
import { ServiceSection } from "./appointment-form/ServiceSection";
import { PromoCodeSection } from "./appointment-form/PromoCodeSection";

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedNanny?: string;
}

export function AppointmentForm({ isOpen, onClose, selectedDate, selectedNanny }: AppointmentFormProps) {
  console.log("AppointmentForm render:", { isOpen, selectedDate, selectedNanny });

  const [dates, setDates] = useState<Date[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [selectedService, setSelectedService] = useState<string>();
  const [promoCode, setPromoCode] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Загрузка профиля родителя
  const { data: parentProfile } = useQuery({
    queryKey: ["parent-profile"],
    queryFn: async () => {
      console.log("Загрузка профиля родителя...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("parent_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        console.error("Ошибка загрузки профиля родителя:", error);
        throw error;
      }
      console.log("Загруженный профиль родителя:", data);
      return data;
    },
  });

  // Загрузка доступных нянь
  const { data: availableNannies } = useQuery({
    queryKey: ["available-nannies", dates, startTime, endTime],
    queryFn: async () => {
      if (!dates.length) return [];

      console.log("Загрузка доступных нянь...");
      const { data, error } = await supabase
        .from("nanny_profiles")
        .select(`
          id,
          profiles (
            first_name,
            last_name,
            photo_url
          )
        `)
        .not("is_deleted", "eq", true);
      
      if (error) {
        console.error("Ошибка загрузки нянь:", error);
        throw error;
      }
      console.log("Загруженные няни:", data);
      return data;
    },
    enabled: dates.length > 0 && !!startTime && !!endTime,
  });

  // Загрузка услуг
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      console.log("Загрузка услуг...");
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("price_per_hour");

      if (error) {
        console.error("Ошибка загрузки услуг:", error);
        throw error;
      }
      console.log("Загруженные услуги:", data);
      return data;
    },
  });

  const calculateTotalPrice = (discountPercent = 0) => {
    if (!selectedService || !services) return;

    const service = services.find(s => s.id === selectedService);
    if (!service) return;

    const hoursPerDay = (
      parseInt(endTime.split(":")[0]) - 
      parseInt(startTime.split(":")[0])
    );
    
    const totalDays = dates.length;
    const basePrice = service.price_per_hour * hoursPerDay * totalDays;
    const discount = basePrice * (discountPercent / 100);
    
    console.log("Расчет стоимости:", {
      hoursPerDay,
      totalDays,
      basePrice,
      discount,
      finalPrice: basePrice - discount
    });
    
    setTotalPrice(basePrice - discount);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("Загружено фото:", file.name);
    setPhotoFile(file);
  };

  const handleSubmit = async () => {
    console.log("Отправка формы:", {
      selectedService,
      dates,
      selectedNanny,
      parentProfile,
      totalPrice,
      photoFile
    });

    if (!selectedService || !dates.length || !selectedNanny || !parentProfile?.id) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    try {
      let photoUrl = null;
      
      // Загружаем фото, если оно есть
      if (photoFile) {
        console.log("Загрузка фото в storage...");
        const fileExt = photoFile.name.split('.').pop();
        const filePath = `${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('appointment_photos')
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('appointment_photos')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
        console.log("Фото загружено:", photoUrl);
      }

      // Создаем заявки для каждого выбранного дня
      console.log("Создание заявок...");
      for (const date of dates) {
        const startDateTime = new Date(date);
        const [startHours, startMinutes] = startTime.split(":");
        startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

        const endDateTime = new Date(date);
        const [endHours, endMinutes] = endTime.split(":");
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

        console.log("Создание заявки на дату:", {
          date,
          startDateTime,
          endDateTime
        });

        const { error } = await supabase
          .from("appointments")
          .insert({
            nanny_id: selectedNanny,
            parent_id: parentProfile.id,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            service_id: selectedService,
            total_price: totalPrice / dates.length,
            photo_url: photoUrl,
            booking_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          });

        if (error) throw error;
      }

      console.log("Заявки успешно созданы");
      toast({
        title: "Успешно",
        description: "Заявки созданы. У вас есть 15 минут на оплату.",
      });

      onClose();
    } catch (error) {
      console.error("Ошибка создания заявок:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать заявки",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Создать заявку</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <DateTimeSection
            dates={dates}
            setDates={setDates}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
          />

          <ServiceSection
            selectedService={selectedService}
            setSelectedService={setSelectedService}
          />

          <PromoCodeSection
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            onPromoCodeCheck={calculateTotalPrice}
          />

          <div className="grid gap-2">
            <Label>Фото</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>

          {availableNannies?.length === 0 && (
            <div className="text-red-500">
              На выбранное время нет доступных нянь. Пожалуйста, свяжитесь с администратором.
            </div>
          )}

          <div className="text-lg font-semibold">
            Итоговая стоимость: {totalPrice} ₽
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedService || !dates.length || !selectedNanny || !availableNannies?.length}
          >
            Создать заявку
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}