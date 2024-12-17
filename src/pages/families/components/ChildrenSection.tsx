import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChildFormData {
  first_name: string;
  gender: string;
  birth_date: string;
  medical_conditions?: string;
  notes?: string;
  notify_before_birthday: number;
}

interface ChildrenSectionProps {
  parentId: string;
}

const ChildrenSection = ({ parentId }: ChildrenSectionProps) => {
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<ChildFormData>();

  const { data: children } = useQuery({
    queryKey: ["children", parentId],
    queryFn: async () => {
      console.log("Загрузка списка детей...");
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_profile_id", parentId);

      if (error) {
        console.error("Ошибка при загрузке детей:", error);
        throw error;
      }

      console.log("Загружены дети:", data);
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ChildFormData) => {
      console.log("Сохранение данных ребенка...", data);
      const { data: child, error } = await supabase
        .from("children")
        .upsert({
          id: selectedChild?.id,
          parent_profile_id: parentId,
          ...data,
        })
        .select()
        .single();

      if (error) {
        console.error("Ошибка при сохранении ребенка:", error);
        throw error;
      }

      return child;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      toast({
        title: "Успешно",
        description: "Данные ребенка сохранены",
      });
      setIsDialogOpen(false);
      setSelectedChild(null);
      form.reset();
    },
    onError: (error) => {
      console.error("Ошибка при сохранении:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить данные ребенка",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (childId: string) => {
      console.log("Удаление ребенка...", childId);
      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", childId);

      if (error) {
        console.error("Ошибка при удалении ребенка:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children", parentId] });
      toast({
        title: "Успешно",
        description: "Ребенок удален",
      });
    },
    onError: (error) => {
      console.error("Ошибка при удалении:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить ребенка",
      });
    },
  });

  const onSubmit = (data: ChildFormData) => {
    mutation.mutate(data);
  };

  const handleEdit = (child: any) => {
    setSelectedChild(child);
    form.reset({
      first_name: child.first_name,
      gender: child.gender,
      birth_date: child.birth_date,
      medical_conditions: child.medical_conditions,
      notes: child.notes,
      notify_before_birthday: child.notify_before_birthday,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (childId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить ребенка?")) {
      deleteMutation.mutate(childId);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Дети</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedChild(null);
              form.reset({
                notify_before_birthday: 2,
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить ребенка
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedChild ? "Редактирование" : "Добавление"} ребенка
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пол</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите пол" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Мужской</SelectItem>
                          <SelectItem value="female">Женский</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Дата рождения</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_before_birthday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Уведомить о дне рождения за (дней)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите количество дней" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 день</SelectItem>
                          <SelectItem value="2">2 дня</SelectItem>
                          <SelectItem value="3">3 дня</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medical_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Медицинские противопоказания</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
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
                      <FormLabel>Примечания</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit">Сохранить</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {children?.map((child: any) => (
          <div
            key={child.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <h3 className="font-medium">{child.first_name}</h3>
              <p className="text-sm text-gray-500">
                Дата рождения: {new Date(child.birth_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(child)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(child.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChildrenSection;