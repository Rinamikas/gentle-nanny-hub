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

const generateValidValue = (type: FieldType, input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, name?: string): string => {
  console.log(`Генерация корректного значения для поля типа ${type}, имя: ${name}`);

  if (name?.includes('phone') || type === 'tel') {
    const phoneNumber = faker.string.numeric({ length: 10 });
    return formatPhoneNumber(phoneNumber);
  }

  if (name === 'training_stage') {
    const stages = ['stage_1', 'stage_2', 'stage_3', 'stage_4', 'stage_5'];
    const randomStage = stages[Math.floor(Math.random() * stages.length)];
    console.log('Выбран этап обучения:', randomStage);
    return randomStage;
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
        return String(faker.number.int({ min: 300, max: 1000 }));
      }
      if (name?.includes('experience_years')) {
        return String(faker.number.int({ min: 1, max: 30 }));
      }
      return String(faker.number.int({ min: 0, max: 100 }));
    case 'select':
      if (input instanceof HTMLSelectElement) {
        const options = Array.from(input.options);
        const validOptions = options.filter(opt => opt.value && !opt.disabled);
        if (validOptions.length > 0) {
          const randomOption = validOptions[Math.floor(Math.random() * validOptions.length)];
          console.log(`Выбрано значение ${randomOption.value} для селекта ${name}`);
          return randomOption.value;
        }
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

const triggerReactHookFormEvents = (input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
  console.log(`Эмуляция событий React Hook Form для элемента:`, input);

  // Сохраняем оригинальное значение
  const originalValue = input.value;
  
  // Создаем и диспатчим событие change
  const changeEvent = new Event('change', { bubbles: true });
  Object.defineProperty(changeEvent, 'target', { value: input });
  input.dispatchEvent(changeEvent);

  // Создаем и диспатчим событие blur
  const blurEvent = new Event('blur', { bubbles: true });
  Object.defineProperty(blurEvent, 'target', { value: input });
  input.dispatchEvent(blurEvent);

  console.log(`События успешно отправлены для элемента с value=${originalValue}`);
};

export const fillFormWithTestData = (isValid: boolean = true) => {
  console.log('Заполняем форму тестовыми данными...');

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
      }

      const value = isValid 
        ? generateValidValue(type, input, input.name)
        : generateInvalidValue(type, input.name);
      
      console.log(`Заполняем поле ${input.name} значением:`, value);

      if (input instanceof HTMLSelectElement) {
        input.value = value;
        console.log(`Установлено значение ${value} для селекта ${input.name}`);
      } else {
        input.value = value;
        console.log(`Установлено значение ${value} для поля ${input.name}`);
      }

      triggerReactHookFormEvents(input);
    }
  });

  console.log('Заполнение формы завершено');
};