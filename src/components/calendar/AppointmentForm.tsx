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
import { NannySelect } from "./appointment-form/NannySelect";

interface DateTimeEntry {
  date: Date;
  startTime: string;
  endTime: string;
}

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedNanny?: string;
}

export function AppointmentForm({ isOpen, onClose, selectedDate, selectedNanny: initialNanny }: AppointmentFormProps) {
  console.log("AppointmentForm render:", { isOpen, selectedDate, initialNanny });

  const [dateTimeEntries, setDateTimeEntries] = useState<DateTimeEntry[]>([]);
  const [selectedNanny, setSelectedNanny] = useState<string>();
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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("Загружено фото:", file.name);
    setPhotoFile(file);
  };

  const handleSubmit = async () => {
    console.log("Отправка формы:", {
      selectedService,
      dateTimeEntries,
      selectedNanny,
      parentProfile,
      totalPrice,
      photoFile
    });

    if (!selectedService || !dateTimeEntries.length || !selectedNanny || !parentProfile?.id) {
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
      for (const entry of dateTimeEntries) {
        const startDateTime = new Date(entry.date);
        const [startHours, startMinutes] = entry.startTime.split(":");
        startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

        const endDateTime = new Date(entry.date);
        const [endHours, endMinutes] = entry.endTime.split(":");
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

        console.log("Создание заявки на дату:", {
          date: entry.date,
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
            total_price: totalPrice / dateTimeEntries.length,
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

  // Проверяем, можно ли создать заявку
  const canSubmit = selectedService && dateTimeEntries.length > 0 && selectedNanny && parentProfile?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Создать заявку</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <DateTimeSection
            entries={dateTimeEntries}
            onEntriesChange={setDateTimeEntries}
          />

          <div className="grid gap-2">
            <Label>Няня</Label>
            <NannySelect
              value={selectedNanny}
              onSelect={setSelectedNanny}
              selectedDates={dateTimeEntries}
            />
          </div>

          <ServiceSection
            selectedService={selectedService}
            setSelectedService={setSelectedService}
          />

          <PromoCodeSection
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            onPromoCodeCheck={(discountPercent) => {
              // Пересчитываем стоимость с учетом скидки
              // TODO: Implement price calculation
            }}
          />

          <div className="grid gap-2">
            <Label>Фото</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>

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
            disabled={!canSubmit}
          >
            Создать заявку
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}