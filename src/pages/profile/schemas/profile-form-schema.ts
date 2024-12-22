import * as z from "zod";

export const profileFormSchema = z.object({
  first_name: z.string().min(2, "Минимум 2 символа").max(50, "Максимум 50 символов"),
  last_name: z.string().min(2, "Минимум 2 символа").max(50, "Максимум 50 символов"),
  phone: z.string().min(10, "Введите корректный номер телефона").max(20, "Слишком длинный номер"),
  email: z.string().email("Введите корректный email").optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;