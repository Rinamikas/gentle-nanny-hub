import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { familyFormSchema } from "../schemas/family-form-schema";
import type { FormValues } from "../types/form";
import type { ParentProfile } from "../types/parent-types";
import { useEffect } from "react";

export const useFamilyForm = (familyData: ParentProfile | null) => {
  console.log("useFamilyForm: инициализация с данными:", familyData);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      main_phone: "",
      emergency_phone: "",
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
        email: "", // email не хранится в profiles
        main_phone: familyData.profiles.main_phone || "",
        emergency_phone: familyData.emergency_phone || "",
        address: familyData.address || "",
        special_requirements: familyData.special_requirements || "",
        notes: familyData.notes || "",
        status: familyData.status || "default",
      });
    }
  }, [familyData, form]);

  return form;
};