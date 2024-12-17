import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const workingHoursSchema = z.object({
  day_of_week: z.number().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
});

type WorkingHoursFormValues = z.infer<typeof workingHoursSchema>;

interface WorkingHoursFormProps {
  nannyId: string;
  onSuccess?: () => void;
}

const daysOfWeek = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

export function WorkingHoursForm({ nannyId, onSuccess }: WorkingHoursFormProps) {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const form = useForm<WorkingHoursFormValues>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: {
      day_of_week: 1,
      start_time: "09:00",
      end_time: "18:00",
    },
  });

  const onSubmit = async (values: WorkingHoursFormValues) => {
    try {
      const { error } = await supabase.from("working_hours").upsert({
        nanny_id: nannyId,
        day_of_week: selectedDay,
        start_time: values.start_time,
        end_time: values.end_time,
      });

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Рабочие часы сохранены",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Ошибка при сохранении рабочих часов:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить рабочие часы",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {daysOfWeek.map((day, index) => (
            <Button
              key={index}
              type="button"
              variant={selectedDay === index ? "default" : "outline"}
              onClick={() => setSelectedDay(index)}
            >
              {day}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Начало рабочего дня</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Конец рабочего дня</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Сохранить</Button>
      </form>
    </Form>
  );
}