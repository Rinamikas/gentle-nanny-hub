import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../../types/form";

interface TrainingSectionProps {
  form: UseFormReturn<FormValues>;
}

const TRAINING_STAGES = [
  { value: "stage_1", label: "Этап 1" },
  { value: "stage_2", label: "Этап 2" },
  { value: "stage_3", label: "Этап 3" },
  { value: "stage_4", label: "Этап 4" },
  { value: "stage_5", label: "Этап 5" },
];

export default function TrainingSection({ form }: TrainingSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Обучение</h2>
      
      <FormField
        control={form.control}
        name="training_stage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Этап обучения</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите этап обучения" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TRAINING_STAGES.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}