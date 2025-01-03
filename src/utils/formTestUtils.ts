import { faker } from "@faker-js/faker/locale/ru";

type FieldType = "text" | "tel" | "email" | "date" | "number" | "select" | "status";

const formatPhoneNumber = (number: string): string => {
  const cleaned = number.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
  }
  return `+7${cleaned}`;
};

const getFieldType = (name: string): FieldType => {
  console.log(`Определение типа поля для ${name}`);
  if (name.includes('email')) return 'email';
  if (name.includes('phone')) return 'tel';
  if (name.includes('date')) return 'date';
  if (name.includes('rate') || name.includes('years')) return 'number';
  if (name === 'training_stage') return 'select';
  if (name === 'status') return 'status';
  return 'text';
};

const generateValidValue = (type: FieldType, name?: string): string | number => {
  console.log(`Генерация корректного значения для поля типа ${type}, имя: ${name}`);

  switch (type) {
    case 'tel':
      const phoneNumber = faker.string.numeric({ length: 10 });
      return formatPhoneNumber(phoneNumber);
    
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
        return stages[Math.floor(Math.random() * stages.length)];
      }
      return '';

    case 'status':
      const statuses = ['default', 'star', 'diamond'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    
    default:
      return '';
  }
};

const generateInvalidValue = (type: FieldType): string => {
  console.log(`Генерация некорректного значения для поля типа ${type}`);

  switch (type) {
    case 'tel':
      return 'не телефон';
    case 'email':
      return 'неправильный.емейл';
    case 'date':
      return 'не дата';
    case 'number':
      return 'не число';
    case 'select':
      return 'invalid_option';
    case 'status':
      return 'invalid_status';
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

  const { setValue, getValues } = formMethods;

  // Заполняем все поля input и textarea
  document.querySelectorAll('input, textarea').forEach((element) => {
    const input = element as HTMLInputElement | HTMLTextAreaElement;
    if (input.name && !input.disabled && input.style.display !== 'none') {
      console.log(`Обработка поля ${input.name}`);
      
      const type = getFieldType(input.name);
      console.log(`Определен тип поля ${input.name}: ${type}`);

      const value = isValid 
        ? generateValidValue(type, input.name)
        : generateInvalidValue(type);
      
      console.log(`Устанавливаем значение для поля ${input.name}:`, value);
      
      setValue(input.name, value, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    }
  });

  // Обрабатываем select и status поля отдельно
  const specialFields = ['training_stage', 'status'];
  specialFields.forEach(fieldName => {
    console.log(`Обработка специального поля ${fieldName}`);
    
    const type = getFieldType(fieldName);
    const value = isValid 
      ? generateValidValue(type, fieldName)
      : generateInvalidValue(type);

    console.log(`Устанавливаем значение для поля ${fieldName}:`, value);
    
    setValue(fieldName, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  });

  console.log('Значения формы после заполнения:', getValues());
  console.log('Заполнение формы завершено');
};