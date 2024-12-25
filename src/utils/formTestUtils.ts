import { UseFormReturn } from "react-hook-form";

let currentFormMethods: UseFormReturn<any> | null = null;

export const setFormMethods = (methods: UseFormReturn<any> | null) => {
  currentFormMethods = methods;
};

export const fillFormWithTestData = (isValid: boolean) => {
  console.log("Заполняем форму тестовыми данными...");

  if (!currentFormMethods) {
    throw new Error("Form methods не установлены. Используйте setFormMethods для установки методов формы.");
  }

  const { setValue } = currentFormMethods;

  if (isValid) {
    setValue("first_name", "Иван");
    setValue("last_name", "Петров");
    setValue("email", "test@example.com");
    setValue("main_phone", "+7 (999) 123-45-67");
    setValue("emergency_phone", "+7 (999) 765-43-21");
    setValue("address", "ул. Примерная, д. 1");
    setValue("special_requirements", "Особые требования");
    setValue("notes", "Заметки");
    setValue("status", "default");
  } else {
    setValue("first_name", "И");  // Слишком короткое имя
    setValue("last_name", "П");   // Слишком короткая фамилия
    setValue("email", "invalid-email");  // Неверный формат email
    setValue("main_phone", "123");  // Неверный формат телефона
    setValue("emergency_phone", "456");  // Неверный формат телефона
    setValue("address", "ул");  // Слишком короткий адрес
  }
};