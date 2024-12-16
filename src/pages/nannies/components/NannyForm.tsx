import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import ProfessionalInfoSection from "./sections/ProfessionalInfoSection";
import DocumentsSection from "./sections/DocumentsSection";
import TrainingSection from "./sections/TrainingSection";
import { formSchema, FormValues } from "../types/form";
import { useEffect } from "react";

export default function NannyForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      birth_date: "",
      phone: "",
      email: "",
      photo_url: "",
      position: "",
      hourly_rate: 0,
      age_group: "",
      camera_phone: "",
      camera_number: "",
      address: "",
      education: "",
      experience_years: 0,
      relative_phone: "",
      criminal_record: "",
      image_usage_consent: "",
      medical_book: "",
      personal_data_consent: "",
      training_stage: undefined,
    },
  });
  
  const { data: nanny, isLoading } = useQuery({
    queryKey: ["nanny", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("nanny_profiles")
        .select(`
          *,
          profiles(
            first_name,
            last_name,
            email,
            phone
          ),
          nanny_documents(
            type,
            file_url
          ),
          nanny_training(
            stage
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (nanny) {
      const documents = nanny.nanny_documents?.reduce((acc: any, doc: any) => {
        acc[doc.type] = doc.file_url;
        return acc;
      }, {});

      form.reset({
        first_name: nanny.profiles?.first_name || "",
        last_name: nanny.profiles?.last_name || "",
        birth_date: nanny.birth_date || "",
        phone: nanny.profiles?.phone || "",
        email: nanny.profiles?.email || "",
        photo_url: nanny.photo_url || "",
        position: nanny.position || "",
        hourly_rate: nanny.hourly_rate || 0,
        age_group: nanny.age_group || "",
        camera_phone: nanny.camera_phone || "",
        camera_number: nanny.camera_number || "",
        address: nanny.address || "",
        education: nanny.education || "",
        experience_years: nanny.experience_years || 0,
        relative_phone: nanny.relative_phone || "",
        criminal_record: documents?.criminal_record || "",
        image_usage_consent: documents?.image_usage_consent || "",
        medical_book: documents?.medical_book || "",
        personal_data_consent: documents?.personal_data_consent || "",
        training_stage: nanny.nanny_training?.[0]?.stage,
      });
    }
  }, [nanny, form.reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      console.log("Starting mutation with values:", values);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }
      
      if (!session?.user?.id) {
        console.error("No user session found");
        throw new Error("Пользователь не авторизован");
      }

      console.log("User session found:", session.user.id);

      // Сначала создаем или обновляем запись в profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          first_name: values.first_name,
          last_name: values.last_name,
          phone: values.phone,
          email: values.email,
        });

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      console.log("Profile updated successfully");

      // Затем создаем или обновляем профиль няни
      const { data: nannyData, error: nannyError } = await supabase
        .from("nanny_profiles")
        .upsert({
          id: id || undefined,
          user_id: session.user.id,
          birth_date: values.birth_date,
          position: values.position,
          age_group: values.age_group,
          camera_phone: values.camera_phone,
          camera_number: values.camera_number,
          address: values.address,
          relative_phone: values.relative_phone,
          experience_years: values.experience_years,
          education: values.education,
          hourly_rate: values.hourly_rate,
          photo_url: values.photo_url,
        })
        .select()
        .single();

      if (nannyError) {
        console.error("Nanny profile update error:", nannyError);
        throw nannyError;
      }

      console.log("Nanny profile updated successfully");

      // Обновляем документы
      const documents = [
        { type: "criminal_record", file_url: values.criminal_record },
        { type: "image_usage_consent", file_url: values.image_usage_consent },
        { type: "medical_book", file_url: values.medical_book },
        { type: "personal_data_consent", file_url: values.personal_data_consent },
      ].filter(doc => doc.file_url);

      for (const doc of documents) {
        const { error: docError } = await supabase
          .from("nanny_documents")
          .upsert({
            nanny_id: nannyData.id,
            type: doc.type,
            file_url: doc.file_url,
          });

        if (docError) {
          console.error(`Document update error for ${doc.type}:`, docError);
          throw docError;
        }
      }

      console.log("Documents updated successfully");

      // Обновляем этап обучения
      if (values.training_stage) {
        const { error: trainingError } = await supabase
          .from("nanny_training")
          .upsert({
            nanny_id: nannyData.id,
            stage: values.training_stage,
          });

        if (trainingError) {
          console.error("Training stage update error:", trainingError);
          throw trainingError;
        }

        console.log("Training stage updated successfully");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nannies"] });
      toast({
        title: "Успешно",
        description: "Данные сохранены",
      });
      navigate("/nannies");
    },
    onError: (error) => {
      console.error("Error saving nanny:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить данные",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        {id ? "Редактирование анкеты няни" : "Создание анкеты няни"}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-8">
            <PersonalInfoSection form={form} />
            <ProfessionalInfoSection form={form} />
            <DocumentsSection form={form} />
            <TrainingSection form={form} />
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate("/nannies")}
            >
              Отмена
            </Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}