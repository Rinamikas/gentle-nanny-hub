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
      console.log("2. ID няни:", nannyId);

      const formattedDate = format(values.work_date, "yyyy-MM-dd");
      console.log("3. Форматированная дата:", formattedDate);

      const { data, error } = await supabase
        .from("working_hours")
        .insert({
          nanny_id: nannyId,
          work_date: formattedDate,
          start_time: values.start_time,
          end_time: values.end_time,
        })
        .select()
        .single();

      console.log("4. Результат сохранения:", { data, error });

      if (error) {
        console.error("5. Ошибка при сохранении:", error);
        throw error;
      }

      toast({
        title: "Успешно",
        description: "Рабочие часы сохранены",
      });

      form.reset();
    } catch (error) {
      console.error("6. Ошибка при сохранении рабочих часов:", error);
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
    <Form {...form}>
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
                      variant="outline"
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      type="button"
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
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={ru}
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
    </Form>
  );
}