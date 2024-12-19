import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, parse } from "date-fns";
import { useState, useEffect } from "react";

interface DateTimeEntry {
  date: Date;
  startTime: string;
  endTime: string;
}

interface DateTimeSectionProps {
  entries: DateTimeEntry[];
  onEntriesChange: (entries: DateTimeEntry[]) => void;
  selectedNanny?: string;
}

interface AvailabilityStatus {
  status: 'available' | 'unavailable' | 'partially';
  message: string;
}

export function DateTimeSection({
  entries,
  onEntriesChange,
  selectedNanny,
}: DateTimeSectionProps) {
  console.log("DateTimeSection render:", { entries, selectedNanny });
  
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailabilityStatus>>({});

  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedNanny) {
        setAvailabilityMap({});
        return;
      }

      const newAvailabilityMap: Record<string, AvailabilityStatus> = {};

      for (const entry of entries) {
        const formattedDate = format(entry.date, 'yyyy-MM-dd');
        
        const { data: workingHours, error } = await supabase
          .from('working_hours')
          .select('*')
          .eq('nanny_id', selectedNanny)
          .eq('work_date', formattedDate)
          .maybeSingle();

        if (error) {
          console.error("Ошибка при проверке рабочих часов:", error);
          continue;
        }

        if (!workingHours) {
          newAvailabilityMap[formattedDate] = {
            status: 'unavailable',
            message: 'Нет рабочих часов'
          };
          continue;
        }

        const workStart = parse(workingHours.start_time, 'HH:mm:ss', new Date());
        const workEnd = parse(workingHours.end_time, 'HH:mm:ss', new Date());
        const requestStart = parse(entry.startTime, 'HH:mm', new Date());
        const requestEnd = parse(entry.endTime, 'HH:mm', new Date());

        if (requestStart >= workStart && requestEnd <= workEnd) {
          newAvailabilityMap[formattedDate] = {
            status: 'available',
            message: 'Доступно'
          };
        } else if (requestStart < workStart || requestEnd > workEnd) {
          newAvailabilityMap[formattedDate] = {
            status: 'partially',
            message: `Доступно только ${format(workStart, 'HH:mm')}-${format(workEnd, 'HH:mm')}`
          };
        } else {
          newAvailabilityMap[formattedDate] = {
            status: 'unavailable',
            message: 'Время не входит в рабочие часы'
          };
        }
      }

      setAvailabilityMap(newAvailabilityMap);
    };

    checkAvailability();
  }, [selectedNanny, entries]);

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) return;

    const newEntries = dates.map(date => {
      const existingEntry = entries.find(
        entry => entry.date.toDateString() === date.toDateString()
      );

      return existingEntry || {
        date,
        startTime: "09:00",
        endTime: "11:00",
      };
    });

    const sortedEntries = newEntries.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    console.log("Отсортированные записи:", sortedEntries);
    onEntriesChange(sortedEntries);
  };

  const handleTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const newEntries = [...entries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: value,
    };
    onEntriesChange(newEntries);
  };

  const handleRemoveEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onEntriesChange(newEntries);
  };

  const getAvailabilityIcon = (status: AvailabilityStatus['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'partially':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'unavailable':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Выберите дни</Label>
        <Calendar
          mode="multiple"
          selected={entries.map((entry) => entry.date)}
          onSelect={(dates) => {
            if (Array.isArray(dates)) {
              handleDateSelect(dates);
            }
          }}
          locale={ru}
          className="rounded-md border"
        />
      </div>

      <div className="space-y-2">
        <Label>Время для каждого дня</Label>
        {entries.map((entry, index) => {
          const formattedDate = format(entry.date, 'yyyy-MM-dd');
          const availability = availabilityMap[formattedDate];
          
          return (
            <div key={entry.date.toISOString()} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span>{entry.date.toLocaleDateString("ru-RU")}</span>
                  {selectedNanny && availability && (
                    <>
                      {getAvailabilityIcon(availability.status)}
                      <span className="text-xs">{availability.message}</span>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="time"
                      value={entry.startTime}
                      onChange={(e) =>
                        handleTimeChange(index, "startTime", e.target.value)
                      }
                      min="09:00"
                      max="21:00"
                    />
                  </div>
                  <div>
                    <Input
                      type="time"
                      value={entry.endTime}
                      onChange={(e) =>
                        handleTimeChange(index, "endTime", e.target.value)
                      }
                      min="09:00"
                      max="21:00"
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveEntry(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}