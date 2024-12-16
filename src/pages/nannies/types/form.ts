import { z } from "zod";

export const formSchema = z.object({
  first_name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  last_name: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  email: z.string().email("Введите корректный email"),
  experience_years: z.number().min(0, "Опыт работы не может быть отрицательным"),
  education: z.string().min(10, "Опишите ваше образование подробнее"),
  hourly_rate: z.number().min(0, "Ставка не может быть отрицательной"),
  photo_url: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;