import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ru } from "date-fns/locale";

interface DateTimeSectionProps {
  dates: Date[];
  setDates: (dates: Date[]) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
}

export function DateTimeSection({
  dates,
  setDates,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}: DateTimeSectionProps) {
  console.log("DateTimeSection render:", { dates, startTime, endTime });
  
  return (
    <>
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
    </>
  );
}