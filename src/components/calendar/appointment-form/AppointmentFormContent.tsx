import { DateTimeSection } from "./DateTimeSection";
import { NannySelect } from "./NannySelect";
import { ServiceSection } from "./ServiceSection";
import { PromoCodeSection } from "./PromoCodeSection";
import { ParentSelect } from "./ParentSelect";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AppointmentFormContentProps {
  dateTimeEntries: Array<{ date: Date; startTime: string; endTime: string }>;
  onDateTimeEntriesChange: (entries: Array<{ date: Date; startTime: string; endTime: string }>) => void;
  selectedNanny?: string;
  onNannySelect: (nannyId: string) => void;
  selectedService?: string;
  onServiceSelect: (serviceId: string) => void;
  selectedParent?: string;
  onParentSelect: (parentId: string) => void;
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onPromoCodeCheck: (discountPercent: number) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function AppointmentFormContent({
  dateTimeEntries,
  onDateTimeEntriesChange,
  selectedNanny,
  onNannySelect,
  selectedService,
  onServiceSelect,
  selectedParent,
  onParentSelect,
  promoCode,
  onPromoCodeChange,
  onPromoCodeCheck,
  onCancel,
  onSubmit,
  isSubmitting,
}: AppointmentFormContentProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <DateTimeSection 
        entries={dateTimeEntries}
        onEntriesChange={onDateTimeEntriesChange}
        selectedNanny={selectedNanny}
      />
      <NannySelect 
        value={selectedNanny} 
        onSelect={onNannySelect}
        selectedDates={dateTimeEntries}
      />
      <ParentSelect
        value={selectedParent}
        onSelect={onParentSelect}
      />
      <ServiceSection 
        selectedService={selectedService}
        setSelectedService={onServiceSelect}
      />
      <PromoCodeSection 
        promoCode={promoCode}
        setPromoCode={onPromoCodeChange}
        onPromoCodeCheck={onPromoCodeCheck}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Сохранить
        </Button>
      </div>
    </form>
  );
}