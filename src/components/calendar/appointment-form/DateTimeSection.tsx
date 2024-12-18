import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DateTimeEntry {
  date: Date;
  startTime: string;
  endTime: string;
}

interface DateTimeSectionProps {
  entries: DateTimeEntry[];
  onEntriesChange: (entries: DateTimeEntry[]) => void;
}

export function DateTimeSection({
  entries,
  onEntriesChange,
}: DateTimeSectionProps) {
  console.log("DateTimeSection render:", { entries });

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const existingEntry = entries.find(
      (entry) => entry.date.toDateString() === date.toDateString()
    );

    if (!existingEntry) {
      onEntriesChange([
        ...entries,
        { date, startTime: "09:00", endTime: "11:00" },
      ]);
    }
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

  return (
    <div className="space-y-4">
      <div>
        <Label>Выберите дни</Label>
        <Calendar
          mode="multiple"
          selected={entries.map((entry) => entry.date)}
          onSelect={(dates) => {
            if (!dates) return;
            if (Array.isArray(dates)) {
              const lastDate = dates[dates.length - 1];
              if (lastDate) {
                handleDateSelect(lastDate);
              }
            } else {
              handleDateSelect(dates);
            }
          }}
          locale={ru}
          className="rounded-md border"
        />
      </div>

      <div className="space-y-2">
        <Label>Время для каждого дня</Label>
        {entries.map((entry, index) => (
          <div key={entry.date.toISOString()} className="flex items-center gap-2">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">
                {entry.date.toLocaleDateString("ru-RU")}
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
        ))}
      </div>
    </div>
  );
}