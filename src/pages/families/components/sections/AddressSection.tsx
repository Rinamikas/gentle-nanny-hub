import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../../types/form";

interface AddressSectionProps {
  form: UseFormReturn<FormValues>;
}

export default function AddressSection({ form }: AddressSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Адрес и дополнительная информация</h2>
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Адрес</FormLabel>
            <FormControl>
              <Input placeholder="Введите адрес" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Заметки</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Введите дополнительную информацию"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}