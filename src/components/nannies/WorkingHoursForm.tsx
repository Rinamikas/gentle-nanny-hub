import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQueryClient } from "@tanstack/react-query";

const workingHoursSchema = z.object({
  work_date: z.date(),
  start_time: z.string(),
  end_time: z.string(),
});

type WorkingHoursFormValues = z.infer<typeof workingHoursSchema>;

interface WorkingHoursFormProps {
  nannyId: string;
}

export function WorkingHoursForm({ nannyId }: WorkingHoursFormProps) {
  console.log("Rendering WorkingHoursForm for nanny:", nannyId);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date>();

  const form = useForm<WorkingHoursFormValues>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: {
      start_time: "09:00",
      end_time: "18:00",
    },
  });

  const onSubmit = async (values: WorkingHoursFormValues) => {
    try {
      console.log("Начинаем сохранение рабочих часов:", values);
      const formattedDate = format(values.work_date, "yyyy-MM-dd");
      console.log("Форматированная дата:", formattedDate);

      const { data, error } = await supabase.from("working_hours").insert({
        nanny_id: nannyId,
        work_date: formattedDate,
        start_time: values.start_time,
        end_time: values.end_time,
      }).select();

      console.log("Результат сохранения:", { data, error });

      if (error) {
        console.error("Ошибка при сохранении:", error);
        throw error;
      }

      toast({
        title: "Успешно",
        description: "Рабочие часы сохранены",
      });

      console.log("Обновляем кэш запроса working-hours");
      await queryClient.invalidateQueries({ queryKey: ["working-hours", nannyId] });
      
      form.reset();
      setDate(undefined);
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
    <div className="space-y-4">
      <div {...form.formState}>
        <div onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="work_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Дата</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ru })
                        ) : (
                          <span>Выберите дату</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          console.log("Выбрана дата:", date);
                          setDate(date);
                          field.onChange(date);
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Начало рабочего дня</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      {...field} 
                      onChange={(e) => {
                        console.log("Изменено время начала:", e.target.value);
                        field.onChange(e);
                      }}
                    />
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
                    <Input 
                      type="time" 
                      {...field}
                      onChange={(e) => {
                        console.log("Изменено время окончания:", e.target.value);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="button" 
            onClick={form.handleSubmit(onSubmit)}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}