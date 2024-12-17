import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/LoadingScreen";
import ChildrenSection from "./ChildrenSection";

interface FamilyFormData {
  first_name: string;
  last_name: string;
  phone: string;
  additional_phone?: string;
  address: string;
  status: "default" | "star" | "diamond";
  notes?: string;
}

const FamilyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<FamilyFormData>();

  const { data: family, isLoading } = useQuery({
    queryKey: ["family", id],
    queryFn: async () => {
      if (!id) return null;

      console.log("Загрузка данных семьи...");
      const { data, error } = await supabase
        .from("parent_profiles")
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            phone
          ),
          children (*)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Ошибка при загрузке семьи:", error);
        throw error;
      }

      console.log("Загружены данные семьи:", data);
      return data;
    },
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (data: FamilyFormData) => {
      console.log("Сохранение данных семьи...", data);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        throw new Error("Не авторизован");
      }

      // Создаем или обновляем профиль
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: session.session.user.id,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
        })
        .select()
        .single();

      if (profileError) {
        console.error("Ошибка при сохранении профиля:", profileError);
        throw profileError;
      }

      // Создаем или обновляем профиль родителя
      const { data: parentProfile, error: parentError } = await supabase
        .from("parent_profiles")
        .upsert({
          id: id || undefined,
          user_id: profile.id,
          address: data.address,
          status: data.status,
          additional_phone: data.additional_phone,
          notes: data.notes,
        })
        .select()
        .single();

      if (parentError) {
        console.error("Ошибка при сохранении профиля родителя:", parentError);
        throw parentError;
      }

      return parentProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      toast({
        title: "Успешно",
        description: "Данные семьи сохранены",
      });
      navigate("/families");
    },
    onError: (error) => {
      console.error("Ошибка при сохранении:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить данные семьи",
      });
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  const onSubmit = (data: FamilyFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        {id ? "Редактирование" : "Создание"} анкеты семьи
      </h1>

      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                defaultValue={family?.profiles?.first_name || ""}
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
                name="last_name"
                defaultValue={family?.profiles?.last_name || ""}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Фамилия</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                defaultValue={family?.profiles?.phone || ""}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Основной телефон</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additional_phone"
                defaultValue={family?.additional_phone || ""}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дополнительный телефон</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                defaultValue={family?.status || "default"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Статус</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите статус" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="default">Обычный</SelectItem>
                        <SelectItem value="star">Звезда</SelectItem>
                        <SelectItem value="diamond">Бриллиант</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              defaultValue={family?.address || ""}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              defaultValue={family?.notes || ""}
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
                onClick={() => navigate("/families")}
              >
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </Form>

        {id && <ChildrenSection parentId={id} />}
      </div>
    </div>
  );
};

export default FamilyForm;