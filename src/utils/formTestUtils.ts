import { faker } from '@faker-js/faker/locale/ru';
import { UseFormReturn } from 'react-hook-form';

let formMethods: UseFormReturn<any> | null = null;

export const setFormMethods = (methods: UseFormReturn<any> | null) => {
  formMethods = methods;
};

export const fillFormWithTestData = (isValid: boolean = true) => {
  console.log("Filling form with test data, isValid:", isValid);
  
  if (!formMethods) {
    console.error("Form methods not found");
    return;
  }

  const formatPhoneNumber = () => {
    return `+7${faker.string.numeric(10)}`;
  };

  const data = {
    first_name: isValid ? faker.person.firstName() : faker.string.alpha(2),
    last_name: isValid ? faker.person.lastName() : faker.string.alpha(1),
    birth_date: isValid ? faker.date.past({ years: 30 }).toISOString().split('T')[0] : '2024-13-45',
    phone: isValid ? formatPhoneNumber() : 'invalid-phone',
    email: isValid ? faker.internet.email() : 'invalid-email',
    photo_url: "",
    position: isValid ? faker.person.jobTitle() : '',
    hourly_rate: isValid ? faker.number.int({ min: 300, max: 1000 }) : -100,
    age_group: isValid ? faker.helpers.arrayElement(['0-1', '1-3', '3-5', '6+']) : '',
    camera_phone: isValid ? formatPhoneNumber() : '(invalid)phone',
    camera_number: isValid ? faker.string.numeric(6) : 'abc',
    address: isValid ? faker.location.streetAddress() : '',
    education: isValid ? faker.lorem.paragraph() : '',
    experience_years: isValid ? faker.number.int({ min: 1, max: 20 }) : -5,
    relative_phone: isValid ? formatPhoneNumber() : '(123)456-78-90',
    criminal_record: "",
    image_usage_consent: "",
    medical_book: "",
    personal_data_consent: "",
    training_stage: isValid ? faker.helpers.arrayElement(['stage_1', 'stage_2', 'stage_3', 'stage_4', 'stage_5']) : undefined,
    // Поля для родителей
    emergency_phone: isValid ? formatPhoneNumber() : '(invalid)phone',
    special_requirements: isValid ? faker.lorem.sentence() : '',
    notes: isValid ? faker.lorem.paragraph() : '',
    status: isValid ? faker.helpers.arrayElement(['default', 'verified', 'blocked']) : 'invalid',
  };

  console.log("Setting form data:", data);
  formMethods.reset(data);
};