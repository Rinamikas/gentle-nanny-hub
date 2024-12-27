export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

function isValidE164(phone: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

export function validateUserData(data: unknown): CreateUserData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request data');
  }

  const { email, firstName, lastName, phone } = data as Record<string, unknown>;

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

  return {
    email: email.toLowerCase().trim(),
    firstName,
    lastName,
    phone
  };
}