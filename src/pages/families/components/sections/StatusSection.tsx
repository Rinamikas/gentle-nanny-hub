import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Person, Diamond, Star } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../../types/form";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";

interface StatusSectionProps {
  form: UseFormReturn<FormValues>;
}

export default function StatusSection({ form }: StatusSectionProps) {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Статус семьи</FormLabel>
          <ToggleGroup
            type="single"
            value={field.value}
            onValueChange={field.onChange}
            className="justify-start"
          >
            <ToggleGroupItem value="default" aria-label="Обычный статус">
              <Person className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="diamond" aria-label="Бриллиантовый статус">
              <Diamond className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="star" aria-label="Звездный статус">
              <Star className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </FormItem>
      )}
    />
  );
}