import { faker } from '@faker-js/faker/locale/ru';
import { UseFormReturn } from 'react-hook-form';

export const setFormMethods = (methods: UseFormReturn<any>) => {
  (window as any).formMethods = methods;
};

export const fillFormWithValidData = () => {
  console.log("Filling form with valid test data");
  const formMethods = (window as any).formMethods;
  
  if (!formMethods) {
    console.error("Form methods not found");
    return;
  }

  console.log("Заполняем форму тестовыми данными...");

  const formatPhoneNumber = () => {
    return `+7${faker.string.numeric(10)}`;
  };

  const data = {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    birth_date: faker.date.past({ years: 30 }).toISOString().split('T')[0],
    phone: formatPhoneNumber(),
    email: faker.internet.email(),
    photo_url: "",
    position: faker.person.jobTitle(),
    hourly_rate: faker.number.int({ min: 300, max: 1000 }),
    age_group: faker.helpers.arrayElement(['0-1', '1-3', '3-5', '6+']),
    camera_phone: formatPhoneNumber(),
    camera_number: faker.string.numeric(6),
    address: faker.location.streetAddress(),
    education: faker.lorem.paragraph(),
    experience_years: faker.number.int({ min: 1, max: 20 }),
    relative_phone: formatPhoneNumber(),
    criminal_record: "",
    image_usage_consent: "",
    medical_book: "",
    personal_data_consent: "",
    training_stage: faker.helpers.arrayElement(['stage_1', 'stage_2', 'stage_3', 'stage_4', 'stage_5']),
  };

  formMethods.reset(data);
  console.log("Form filled with data:", data);
};