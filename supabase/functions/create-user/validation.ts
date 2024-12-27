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
  
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    
    // Проверяем валидность даты
    if (isNaN(birth.getTime())) {
      console.error("Invalid birth date format:", birthDate);
      return false;
    }
    
    const age = today.getFullYear() - birth.getFullYear();
    
    // Проверяем, исполнилось ли уже в этом году
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    
    // Если день рождения еще не наступил в этом году
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      return age - 1 >= 18;
    }
    
    return age >= 18;
  } catch (error) {
    console.error("Error validating age:", error);
    return false;
  }
}

export function validateUserData(data: unknown): CreateUserData {
  console.log("Validating user data:", data);

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
  if (birth_date) {
    if (typeof birth_date !== 'string') {
      throw new Error('Birth date must be a string');
    }

    if (!isValidAge(birth_date)) {
      throw new Error('User must be at least 18 years old');
    }
  }

  console.log("Validation passed successfully");

  return {
    email: email.toLowerCase().trim(),
    firstName,
    lastName,
    phone,
    birth_date: birth_date as string
  };
}