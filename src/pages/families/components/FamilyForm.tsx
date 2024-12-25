import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { FormValues } from "../types/form";
import PersonalSection from "./sections/PersonalSection";
import ContactSection from "./sections/ContactSection";
import AddressSection from "./sections/AddressSection";
import StatusSection from "./sections/StatusSection";
import ChildrenSection from "./ChildrenSection";
import { useNavigate, useParams } from "react-router-dom";
import { useFamilyData } from "../hooks/useFamilyData";
import { useFamilyForm } from "../hooks/useFamilyForm";
import { useFamilyMutation } from "../hooks/useFamilyMutation";
import { useEffect } from "react";
import { setFormMethods } from "@/utils/formTestUtils";

interface FamilyFormProps {
  familyId?: string;
  initialData?: any;
  onSubmit?: (data: any) => void;
}

export default function FamilyForm({ familyId: propsFamilyId, initialData, onSubmit }: FamilyFormProps) {
  const navigate = useNavigate();
  const { id: routeFamilyId } = useParams();
  const currentFamilyId = propsFamilyId || routeFamilyId;
  
  console.log("FamilyForm: начало рендера с familyId =", currentFamilyId);

  const { data: familyData, isLoading } = useFamilyData(currentFamilyId);
  const form = useFamilyForm(familyData);
  const mutation = useFamilyMutation(currentFamilyId);

  useEffect(() => {
    setFormMethods(form);
    return () => setFormMethods(null);
  }, [form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      console.log("FamilyForm: начало отправки формы с данными:", values);
      
      if (onSubmit) {
        onSubmit(values);
        return;
      }

      await mutation.mutateAsync(values);
      navigate("/families");
    } catch (error) {
      console.error("FamilyForm: ошибка при сохранении:", error);
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 w-full max-w-2xl mx-auto p-6">
        <PersonalSection form={form} />
        <ContactSection form={form} />
        <AddressSection form={form} />
        <StatusSection form={form} />
        
        <Button type="submit" className="w-full">Сохранить</Button>

        {currentFamilyId && familyData?.id && (
          <div className="mt-8">
            <ChildrenSection parentId={familyData.id} />
          </div>
        )}
      </form>
    </Form>
  );
}