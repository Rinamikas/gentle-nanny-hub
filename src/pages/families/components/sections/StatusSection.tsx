import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { User, Diamond, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const StatusSection = ({ form }: { form: any }) => {
  const statuses = [
    { value: 'default', icon: User, label: 'Обычный' },
    { value: 'premium', icon: Diamond, label: 'Премиум' },
    { value: 'vip', icon: Star, label: 'VIP' }
  ];

  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Статус</FormLabel>
          <FormControl>
            <div className="flex gap-2">
              {statuses.map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  type="button"
                  variant={field.value === value ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => field.onChange(value)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};