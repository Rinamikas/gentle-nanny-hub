import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { familyFormSchema } from "../schemas/family-form-schema";
import type { FormValues } from "../types/form";
import { useEffect } from "react";
import type { ParentProfile } from "@/integrations/supabase/types";

export const useFamilyForm = (familyData: ParentProfile | null) => {
  console.log("useFamilyForm: инициализация с данными:", familyData);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      additional_phone: "",
      address: "",
      special_requirements: "",
      notes: "",
      status: "default",
    },
  });

  useEffect(() => {
    if (familyData?.profiles) {
      console.log("useFamilyForm: обновляем значения формы из данных:", familyData);
      form.reset({
        first_name: familyData.profiles.first_name || "",
        last_name: familyData.profiles.last_name || "",
        email: familyData.profiles.email || "",
        phone: familyData.profiles.phone || "",
        additional_phone: familyData.additional_phone || "",
        address: familyData.address || "",
        special_requirements: familyData.special_requirements || "",
        notes: familyData.notes || "",
        status: familyData.status || "default",
      });
    }
  }, [familyData, form]);

  return form;
};