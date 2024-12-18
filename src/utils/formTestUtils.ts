import { faker } from "@faker-js/faker/locale/ru";

type FieldType = "text" | "tel" | "email" | "date" | "number" | "select";

const formatPhoneNumber = (number: string): string => {
  const cleaned = number.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
  }
  return `+7${cleaned}`;
};

const generateValidValue = (type: FieldType, name?: string): string | number => {
  console.log(`Генерация корректного значения для поля типа ${type}, имя: ${name}`);

  if (name?.includes('phone')) {
    const phoneNumber = faker.string.numeric({ length: 10 });
    return formatPhoneNumber(phoneNumber);
  }

  switch (type) {
    case 'text':
      if (name?.includes('first_name')) {
        return faker.person.firstName();
      }
      if (name?.includes('last_name')) {
        return faker.person.lastName();
      }
      if (name?.includes('education')) {
        return faker.lorem.paragraph();
      }
      if (name?.includes('position')) {
        return faker.person.jobTitle();
      }
      if (name?.includes('camera_number')) {
        return faker.string.numeric(6);
      }
      if (name?.includes('age_group')) {
        return `${faker.number.int({ min: 1, max: 3 })}-${faker.number.int({ min: 4, max: 7 })} лет`;
      }
      if (name?.includes('address')) {
        return faker.location.streetAddress();
      }
      return faker.lorem.words(3);
    case 'email':
      return faker.internet.email();
    case 'date':
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 55);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - 25);
      return faker.date.between({ from: minDate, to: maxDate }).toISOString().split('T')[0];
    case 'number':
      if (name?.includes('hourly_rate')) {
        return faker.number.int({ min: 300, max: 1000 });
      }
      if (name?.includes('experience_years')) {
        return faker.number.int({ min: 1, max: 30 });
      }
      return faker.number.int({ min: 0, max: 100 });
    case 'select':
      if (name === 'training_stage') {
        const stages = ['stage_1', 'stage_2', 'stage_3', 'stage_4', 'stage_5'];
        const randomIndex = faker.number.int({ min: 0, max: stages.length - 1 });
        return stages[randomIndex];
      }
      return '';
    default:
      return '';
  }
};

const generateInvalidValue = (type: FieldType, name?: string): string => {
  console.log(`Генерация некорректного значения для поля типа ${type}, имя: ${name}`);

  switch (type) {
    case 'text':
      if (name?.includes('phone')) {
        return 'не телефон';
      }
      if (name?.includes('email')) {
        return 'неправильный.емейл';
      }
      return faker.number.int({ min: 1, max: 100 }).toString();
    case 'email':
      return 'неправильный.емейл';
    case 'date':
      return 'не дата';
    case 'number':
      return 'не число';
    case 'tel':
      return 'не телефон';
    case 'select':
      return 'invalid_option';
    default:
      return 'некорректное значение';
  }
};

let formMethods: any = null;

export const setFormMethods = (methods: any) => {
  formMethods = methods;
};

export const fillFormWithTestData = (isValid: boolean = true) => {
  console.log('Заполняем форму тестовыми данными...');

  if (!formMethods) {
    console.error('Form methods не установлены. Используйте setFormMethods для установки методов формы.');
    return;
  }

  const { setValue } = formMethods;

  document.querySelectorAll('input, select, textarea').forEach((element) => {
    const input = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    
    if (input.name && !input.disabled && input.style.display !== 'none') {
      console.log(`Обработка поля ${input.name}`);
      
      let type: FieldType = (input as HTMLInputElement).type as FieldType;
      
      if (input instanceof HTMLSelectElement) {
        type = 'select';
        console.log(`Поле ${input.name} определено как select`);
      } else if (input instanceof HTMLTextAreaElement) {
        type = 'text';
        console.log(`Поле ${input.name} определено как textarea`);
      } else if ((input as HTMLInputElement).type === 'email') {
        type = 'email';
        console.log(`Поле ${input.name} определено как email`);
      }

      const value = isValid 
        ? generateValidValue(type, input.name)
        : generateInvalidValue(type, input.name);
      
      console.log(`Устанавливаем значение для поля ${input.name}:`, value);
      setValue(input.name, value, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    }
  });

  console.log('Заполнение формы завершено');
};