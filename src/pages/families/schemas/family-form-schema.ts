import { z } from "zod";

export const familyFormSchema = z.object({
  first_name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  last_name: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  emergency_phone: z.string().optional(),
  address: z.string().min(5, "Введите полный адрес"),
  status: z.enum(["default", "star", "diamond"]).default("default"),
  notes: z.string().optional(),
});