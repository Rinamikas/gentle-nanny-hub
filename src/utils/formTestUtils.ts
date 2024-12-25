import { UseFormReturn } from "react-hook-form";
import { faker } from '@faker-js/faker/locale/ru';

let currentFormMethods: UseFormReturn<any> | null = null;

export const setFormMethods = (methods: UseFormReturn<any> | null) => {
  currentFormMethods = methods;
};

export const fillFormWithTestData = (isValid: boolean) => {
  console.log("Заполняем форму тестовыми данными...");

  if (!currentFormMethods) {
    throw new Error("Form methods не установлены. Используйте setFormMethods для установки методов формы.");
  }

  const { setValue, getValues } = currentFormMethods;
  const currentValues = getValues();

  // Общие поля для всех форм
  if ('first_name' in currentValues) {
    setValue("first_name", isValid ? faker.person.firstName() : "А");
  }
  if ('last_name' in currentValues) {
    setValue("last_name", isValid ? faker.person.lastName() : "Б");
  }
  if ('email' in currentValues) {
    setValue("email", isValid ? faker.internet.email() : "invalid-email");
  }
  if ('main_phone' in currentValues) {
    setValue("main_phone", isValid ? faker.phone.number() : "123");
  }
  if ('emergency_phone' in currentValues) {
    setValue("emergency_phone", isValid ? faker.phone.number() : "456");
  }
  if ('address' in currentValues) {
    setValue("address", isValid ? faker.location.streetAddress(true) : "ул");
  }
  if ('notes' in currentValues) {
    setValue("notes", isValid ? faker.lorem.paragraph() : "");
  }

  // Поля для профиля няни
  if ('birth_date' in currentValues) {
    setValue("birth_date", isValid ? faker.date.past({ years: 30 }).toISOString().split('T')[0] : "2024-01-01");
  }
  if ('position' in currentValues) {
    setValue("position", isValid ? faker.helpers.arrayElement(['Няня', 'Гувернантка', 'Воспитатель']) : "");
  }
  if ('age_group' in currentValues) {
    setValue("age_group", isValid ? faker.helpers.arrayElement(['0-1', '1-3', '3-6', '6+']) : "");
  }
  if ('camera_phone' in currentValues) {
    setValue("camera_phone", isValid ? faker.phone.number() : "789");
  }
  if ('camera_number' in currentValues) {
    setValue("camera_number", isValid ? faker.string.numeric(6) : "12");
  }
  if ('experience_years' in currentValues) {
    setValue("experience_years", isValid ? faker.number.int({ min: 1, max: 20 }) : 0);
  }
  if ('education' in currentValues) {
    setValue("education", isValid ? faker.lorem.sentences(2) : "");
  }
  if ('hourly_rate' in currentValues) {
    setValue("hourly_rate", isValid ? faker.number.int({ min: 300, max: 1000 }) : 0);
  }

  // Поля для профиля родителя
  if ('special_requirements' in currentValues) {
    setValue("special_requirements", isValid ? faker.lorem.paragraph() : "");
  }
  if ('status' in currentValues) {
    setValue("status", isValid ? faker.helpers.arrayElement(['default', 'star', 'diamond']) : "invalid");
  }
};