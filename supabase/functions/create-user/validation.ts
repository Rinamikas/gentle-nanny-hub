export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  birth_date?: string;
}

function isValidE164(phone: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

function isValidAge(birthDate: string | undefined): boolean {
  if (!birthDate) return true; // Если дата не указана, пропускаем проверку
  
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  
  // Проверяем, исполнилось ли уже в этом году
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age >= 18;
}

export function validateUserData(data: unknown): CreateUserData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request data');
  }

  const { email, firstName, lastName, phone, birth_date } = data as Record<string, unknown>;

  if (!email || typeof email !== 'string') {
    throw new Error('Email is required and must be a string');
  }

  if (!firstName || typeof firstName !== 'string') {
    throw new Error('First name is required and must be a string');
  }

  if (!lastName || typeof lastName !== 'string') {
    throw new Error('Last name is required and must be a string');
  }

  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone is required and must be a string');
  }

  // Проверяем формат телефона
  if (!isValidE164(phone)) {
    throw new Error('Phone must be in E.164 format (e.g. +71234567890)');
  }

  // Проверяем возраст если дата указана
  if (birth_date && typeof birth_date === 'string') {
    if (!isValidAge(birth_date)) {
      throw new Error('User must be at least 18 years old');
    }
  }

  return {
    email: email.toLowerCase().trim(),
    firstName,
    lastName,
    phone,
    birth_date: birth_date as string
  };
}