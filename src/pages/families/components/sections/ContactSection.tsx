import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../../types/form";

interface ContactSectionProps {
  form: UseFormReturn<FormValues>;
}

export default function ContactSection({ form }: ContactSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Контактная информация</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Телефон</FormLabel>
              <FormControl>
                <Input placeholder="+7 (999) 999-99-99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="additional_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дополнительный телефон</FormLabel>
              <FormControl>
                <Input placeholder="+7 (999) 999-99-99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}