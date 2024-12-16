import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import PhotoUpload from "../PhotoUpload";
import { FormValues } from "../../types/form";

interface PersonalInfoSectionProps {
  form: UseFormReturn<FormValues>;
}

export default function PersonalInfoSection({ form }: PersonalInfoSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Личная информация</h2>
      
      <div className="mb-6">
        <FormField
          control={form.control}
          name="photo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Фотография</FormLabel>
              <FormControl>
                <PhotoUpload
                  onUpload={(url) => field.onChange(url)}
                  currentPhotoUrl={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input placeholder="Введите имя" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Фамилия</FormLabel>
              <FormControl>
                <Input placeholder="Введите фамилию" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="example@mail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}