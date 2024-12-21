import { faker } from "@faker-js/faker/locale/ru";
import { UseFormReturn } from "react-hook-form";

let formMethods: UseFormReturn<any> | null = null;

export const setFormMethods = (methods: UseFormReturn<any>) => {
  formMethods = methods;
  console.log("Form methods установлены");
};

export const fillFormWithTestData = (type: "valid" | "invalid") => {
  console.log("Заполняем форму тестовыми данными...");
  
  if (!formMethods) {
    console.error("Form methods не установлены. Используйте setFormMethods для установки методов формы.");
    return;
  }

  const { setValue } = formMethods;

  if (type === "valid") {
    setValue("first_name", faker.person.firstName());
    setValue("last_name", faker.person.lastName());
    setValue("phone", faker.phone.number("+7 ### ### ## ##"));
    setValue("additional_phone", faker.phone.number("+7 ### ### ## ##"));
    setValue("address", faker.location.streetAddress());
    setValue("status", "default");
    setValue("notes", faker.lorem.sentence());
  } else {
    setValue("first_name", "a"); // слишком короткое имя
    setValue("last_name", "b"); // слишком короткая фамилия
    setValue("phone", "123"); // неверный формат телефона
    setValue("additional_phone", "456"); // неверный формат телефона
    setValue("address", "ул"); // слишком короткий адрес
    setValue("status", "default");
    setValue("notes", faker.lorem.sentence());
  }
};