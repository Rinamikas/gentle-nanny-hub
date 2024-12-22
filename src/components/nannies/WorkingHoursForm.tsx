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
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkingHoursFormValues>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: {
      start_time: "09:00",
      end_time: "18:00",
    },
  });

  const onSubmit = async (values: WorkingHoursFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("=== Начало сохранения рабочих часов ===");
      console.log("1. Данные формы:", values);

      // Проверяем сессию перед сохранением
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("2. Проверка сессии:", { session, sessionError });

      if (!session) {
        console.error("3. Ошибка: Сессия отсутствует");
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Сессия истекла, пожалуйста, войдите снова",
        });
        navigate("/auth");
        return;
      }

      const formattedDate = format(values.work_date, "yyyy-MM-dd");
      console.log("4. Форматированная дата:", formattedDate);

      const { data, error } = await supabase
        .from("working_hours")
        .insert({
          nanny_id: nannyId,
          work_date: formattedDate,
          start_time: values.start_time,
          end_time: values.end_time,
        })
        .select()
        .maybeSingle();

      console.log("5. Результат сохранения:", { data, error });

      if (error) {
        console.error("6. Ошибка при сохранении:", error);
        throw error;
      }

      toast({
        title: "Успешно",
        description: "Рабочие часы сохранены",
      });

      console.log("7. Обновляем кэш запроса working-hours");
      await queryClient.invalidateQueries({ queryKey: ["working-hours", nannyId] });
      
      form.reset();
      setDate(undefined);
    } catch (error) {
      console.error("8. Ошибка при сохранении рабочих часов:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить рабочие часы",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
      </form>
    </div>
  );
}