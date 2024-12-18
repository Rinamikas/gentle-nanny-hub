import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedNanny?: string;
}

export function AppointmentForm({ isOpen, onClose, selectedDate, selectedNanny }: AppointmentFormProps) {
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("parent_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Загрузка услуг
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  // Загрузка доступных нянь
  const { data: availableNannies } = useQuery({
    queryKey: ["available-nannies", dates, startTime, endTime],
    queryFn: async () => {
      if (!dates.length) return [];

      const { data, error } = await supabase
        .from("nanny_profiles")
        .select(`
          id,
          first_name,
          last_name,
          photo_url
        `)
        .not("is_deleted", "eq", true);
      
      if (error) throw error;
      return data;
    },
    enabled: dates.length > 0 && !!startTime && !!endTime,
  });

  // Проверка промокода
  const checkPromoCode = async () => {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoCode)
      .eq("is_active", true)
      .gte("valid_until", new Date().toISOString())
      .lte("valid_from", new Date().toISOString())
      .single();

    if (error || !data) {
      toast({
        title: "Ошибка",
        description: "Промокод недействителен",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Успешно",
      description: `Применена скидка ${data.discount_percent}%`,
    });

    // Пересчитываем стоимость
    calculateTotalPrice(data.discount_percent);
  };

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
    
    setTotalPrice(basePrice - discount);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
  };

  const handleSubmit = async () => {
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
      }

      // Создаем заявки для каждого выбранного дня
      for (const date of dates) {
        const startDateTime = new Date(date);
        const [startHours, startMinutes] = startTime.split(":");
        startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

        const endDateTime = new Date(date);
        const [endHours, endMinutes] = endTime.split(":");
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

        const { error } = await supabase
          .from("appointments")
          .insert({
            nanny_id: selectedNanny,
            parent_id: parentProfile.id, // Добавляем parent_id из профиля
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            service_id: selectedService,
            total_price: totalPrice / dates.length,
            photo_url: photoUrl,
            booking_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          });

        if (error) throw error;
      }

      toast({
        title: "Успешно",
        description: "Заявки созданы. У вас есть 15 минут на оплату.",
      });

      onClose();
    } catch (error) {
      console.error("Error creating appointments:", error);
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
          <div className="grid gap-2">
            <Label>Выберите дни</Label>
            <Calendar
              mode="multiple"
              selected={dates}
              onSelect={setDates}
              locale={ru}
              className="rounded-md border"
              initialFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Время начала</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                min="09:00"
                max="21:00"
              />
            </div>

            <div className="grid gap-2">
              <Label>Время окончания</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                min="09:00"
                max="21:00"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Услуга</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите услугу" />
              </SelectTrigger>
              <SelectContent>
                {services?.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - {service.price_per_hour} ₽/час
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Промокод</Label>
            <div className="flex gap-2">
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Введите промокод"
              />
              <Button onClick={checkPromoCode} type="button">
                Применить
              </Button>
            </div>
          </div>

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
