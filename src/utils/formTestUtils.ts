import { faker } from '@faker-js/faker/locale/ru';

type FieldType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'time';

const generateValidValue = (type: FieldType, placeholder?: string): string => {
  switch (type) {
    case 'email':
      return faker.internet.email();
    case 'tel':
      return faker.helpers.fromRegExp('+7[0-9]{10}');
    case 'number':
      return faker.number.int({ min: 1, max: 100 }).toString();
    case 'date':
      return faker.date.between({ 
        from: '1960-01-01', 
        to: '2000-12-31' 
      }).toISOString().split('T')[0];
    case 'time':
      return faker.date.soon().toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    default:
      if (placeholder?.toLowerCase().includes('имя')) {
        return faker.person.firstName();
      }
      if (placeholder?.toLowerCase().includes('фамилия')) {
        return faker.person.lastName();
      }
      if (placeholder?.toLowerCase().includes('адрес')) {
        return faker.location.streetAddress();
      }
      return faker.word.words({ count: { min: 2, max: 5 } });
  }
};

const generateInvalidValue = (type: FieldType): string => {
  const invalidValues = {
    email: 'not-an-email',
    tel: 'not-a-phone',
    number: 'abc',
    date: 'not-a-date',
    time: 'not-a-time',
    text: '',
  };
  return invalidValues[type] || '';
};

export const fillFormWithTestData = (valid: boolean = true) => {
  console.log('Заполняем форму тестовыми данными...');
  
  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach((input: HTMLElement) => {
    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      const type = input.type as FieldType;
      const value = valid 
        ? generateValidValue(type, input.placeholder)
        : generateInvalidValue(type);
      
      // Создаем событие change
      const event = new Event('change', { bubbles: true });
      input.value = value;
      input.dispatchEvent(event);
      
      console.log(`Заполнено поле ${input.name || input.id}: ${value}`);
    }
  });
};