import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ServiceSectionProps {
  selectedService: string;
  setSelectedService: (service: string) => void;
}

export function ServiceSection({ selectedService, setSelectedService }: ServiceSectionProps) {
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      console.log("Загрузка услуг...");
      const { data, error } = await supabase
        .from("services")
        .select("*");
      
      if (error) {
        console.error("Ошибка загрузки услуг:", error);
        throw error;
      }
      console.log("Загруженные услуги:", data);
      return data;
    },
  });

  return (
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
  );
}