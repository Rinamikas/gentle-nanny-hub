import { faker } from "@faker-js/faker/locale/ru";

type ValidityType = "valid" | "invalid";

export const fillFormWithTestData = (type: ValidityType) => {
  const isValid = type === "valid";
  
  const form = document.querySelector("form");
  if (!form) return;

  const formData = {
    firstName: isValid ? faker.person.firstName() : "a",
    lastName: isValid ? faker.person.lastName() : "b",
    phone: isValid ? faker.phone.number("+7 ### ### ## ##") : "invalid",
    additionalPhone: isValid ? faker.phone.number("+7 ### ### ## ##") : "invalid",
    email: isValid ? faker.internet.email() : "invalid-email",
    address: isValid ? faker.location.streetAddress() : "c",
    notes: isValid ? faker.lorem.paragraph() : "d",
  };

  Object.entries(formData).forEach(([key, value]) => {
    const input = form.querySelector(`[name="${key}"]`);
    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
};
