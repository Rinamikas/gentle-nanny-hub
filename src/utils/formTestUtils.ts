import { faker } from "@faker-js/faker";
import { ru } from "@faker-js/faker/locale/ru";

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
  faker.setLocale('ru');

  // Специальная обработка для полей с контактными данными
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
      return faker.lorem.words(3);
    case 'email':
      return faker.internet.email();
    case 'date':
      return faker.date.past().toISOString().split('T')[0];
    case 'number':
      if (name?.includes('hourly_rate')) {
        return String(faker.number.int({ min: 20, max: 100 }));
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
  faker.setLocale('ru');

  switch (type) {
    case 'text':
      if (name?.includes('phone')) {
        return 'не телефон';
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

export const fillFormWithTestData = (isValid: boolean = true) => {
  console.log('Заполняем форму тестовыми данными...');

  document.querySelectorAll('input, select, textarea').forEach((element) => {
    const input = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (input.name && !input.disabled && input.style.display !== 'none') {
      let type: FieldType = (input as HTMLInputElement).type as FieldType;
      
      // Определяем тип поля
      if (input instanceof HTMLSelectElement) {
        type = 'select';
      } else if (input instanceof HTMLTextAreaElement) {
        type = 'text';
      }

      const value = isValid 
        ? generateValidValue(type, input, input.name)
        : generateInvalidValue(type, input.name);
      console.log(`Заполнено поле ${input.name}: ${value}`);

      // Устанавливаем значение
      if (input instanceof HTMLSelectElement) {
        input.value = value;
      } else {
        (input as HTMLInputElement).value = value;
      }

      // Эмулируем события для активации валидации
      ['input', 'change', 'blur'].forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        input.dispatchEvent(event);
      });
    }
  });
};