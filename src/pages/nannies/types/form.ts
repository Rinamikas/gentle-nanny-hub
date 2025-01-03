import { z } from "zod";

export const formSchema = z.object({
  first_name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  last_name: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
  birth_date: z.string().min(1, "Выберите дату рождения"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  email: z.string().email("Введите корректный email"),
  photo_url: z.string().optional(),
  position: z.string().min(2, "Введите должность"),
  hourly_rate: z.number().min(0, "Ставка не может быть отрицательной"),
  age_group: z.string().min(2, "Укажите возрастную группу"),
  camera_phone: z.string().min(10, "Введите корректный номер телефона камеры"),
  camera_number: z.string().min(1, "Введите номер камеры"),
  address: z.string().min(5, "Введите полный адрес"),
  education: z.string().min(10, "Опишите ваше образование подробнее"),
  experience_years: z.number().min(0, "Опыт работы не может быть отрицательным"),
  emergency_phone: z.string().min(10, "Введите корректный номер телефона родственника"),
  criminal_record: z.string().optional(),
  image_usage_consent: z.string().optional(),
  medical_book: z.string().optional(),
  personal_data_consent: z.string().optional(),
  training_stage: z.enum(["stage_1", "stage_2", "stage_3", "stage_4", "stage_5"]).optional(),
});

export type FormValues = z.infer<typeof formSchema>;