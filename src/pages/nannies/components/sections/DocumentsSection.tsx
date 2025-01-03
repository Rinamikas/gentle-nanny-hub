import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../../types/form";
import DocumentUpload from "../DocumentUpload";

interface DocumentsSectionProps {
  form: UseFormReturn<FormValues>;
}

export default function DocumentsSection({ form }: DocumentsSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Документы</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Адрес проживания</FormLabel>
              <FormControl>
                <Input placeholder="Введите адрес" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emergency_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Телефон родственника</FormLabel>
              <FormControl>
                <Input placeholder="+7 (999) 999-99-99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="criminal_record"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Справка об отсутствии судимости</FormLabel>
              <FormControl>
                <DocumentUpload
                  onUpload={(url) => field.onChange(url)}
                  currentFileUrl={field.value}
                  type="criminal_record"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_usage_consent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Согласие на использование изображения</FormLabel>
              <FormControl>
                <DocumentUpload
                  onUpload={(url) => field.onChange(url)}
                  currentFileUrl={field.value}
                  type="image_usage_consent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medical_book"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Медицинская книжка</FormLabel>
              <FormControl>
                <DocumentUpload
                  onUpload={(url) => field.onChange(url)}
                  currentFileUrl={field.value}
                  type="medical_book"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personal_data_consent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Согласие на обработку персональных данных</FormLabel>
              <FormControl>
                <DocumentUpload
                  onUpload={(url) => field.onChange(url)}
                  currentFileUrl={field.value}
                  type="personal_data_consent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}