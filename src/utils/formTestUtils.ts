import { faker } from '@faker-js/faker/locale/ru';

type FieldType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'time';

const generateValidValue = (type: FieldType, placeholder?: string): string => {
  switch (type) {
    case 'email':
      return faker.internet.email();
    case 'tel':
      return `+7${faker.string.numeric(10)}`;
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
      if (placeholder?.toLowerCase().includes('должность')) {
        return faker.person.jobTitle();
      }
      if (placeholder?.toLowerCase().includes('возраст')) {
        return `${faker.number.int({ min: 1, max: 12 })} лет`;
      }
      return faker.lorem.words({ min: 2, max: 5 });
  }
};

const generateInvalidValue = (type: FieldType): string => {
  switch (type) {
    case 'email':
      return 'неправильный.email';
    case 'tel':
      return 'не-номер-телефона';
    case 'number':
      return 'не число';
    case 'date':
      return '2023-13-45'; // Неверный формат даты
    case 'time':
      return '25:70'; // Неверное время
    default:
      return '';
  }
};

export const fillFormWithTestData = (valid: boolean = true) => {
  console.log('Заполняем форму тестовыми данными...');
  
  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach((input: HTMLElement) => {
    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      // Пропускаем поля для загрузки файлов
      if (input.type === 'file') {
        return;
      }

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