import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import ProfessionalInfoSection from "./sections/ProfessionalInfoSection";
import DocumentsSection from "./sections/DocumentsSection";
import TrainingSection from "./sections/TrainingSection";
import WorkingHoursSection from "./sections/WorkingHoursSection";
import { formSchema, FormValues } from "../types/form";
import { useNannyMutation } from "../hooks/useNannyMutation";
import { useNannyData } from "../hooks/useNannyData";
import { setFormMethods } from "@/utils/formTestUtils";
import { useEffect } from "react";

const NannyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
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

  useEffect(() => {
    setFormMethods(form);
  }, [form]);

  const { data: nanny, isLoading } = useNannyData(id);

  useEffect(() => {
    if (nanny) {
      console.log("Setting form values with nanny data:", nanny);
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
        criminal_record: nanny.nanny_documents?.find(doc => doc.type === "criminal_record")?.file_url || "",
        image_usage_consent: nanny.nanny_documents?.find(doc => doc.type === "image_usage_consent")?.file_url || "",
        medical_book: nanny.nanny_documents?.find(doc => doc.type === "medical_book")?.file_url || "",
        personal_data_consent: nanny.nanny_documents?.find(doc => doc.type === "personal_data_consent")?.file_url || "",
        training_stage: nanny.nanny_training?.stage,
      });
    }
  }, [nanny, form]);

  const mutation = useNannyMutation(() => navigate("/nannies"));

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted with data:", data);
    mutation.mutate(data);
  };

  const handleBack = () => {
    navigate("/nannies");
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к списку
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold mt-6 mb-6">
        {id ? "Редактирование анкеты няни" : "Создание анкеты няни"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-8">
            <PersonalInfoSection form={form} />
            <ProfessionalInfoSection form={form} />
            <DocumentsSection form={form} />
            <TrainingSection form={form} />
            {id && <WorkingHoursSection nannyId={id} />}
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleBack}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default NannyForm;