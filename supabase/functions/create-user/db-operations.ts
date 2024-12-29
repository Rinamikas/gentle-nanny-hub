import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { TestUserData } from './types.ts';
import { createAuthUser, deleteAuthUser } from './auth-operations.ts';
import { createUserProfile, deleteUserProfile } from './profile-operations.ts';

export async function deleteUserData(supabase: ReturnType<typeof createClient>, userId: string) {
  console.log('🗑️ Начинаем удаление данных пользователя:', userId);
  
  try {
    // Проверяем существование в profiles
    console.log('🔍 Проверяем существование в profiles...');
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      console.log('ℹ️ Профиль не найден, пропускаем удаление данных');
      return true;
    }

    // Удаляем все связанные данные
    await deleteUserProfile(supabase, userId);
    await deleteAuthUser(supabase, userId);

    return true;
  } catch (error) {
    console.error('❌ Ошибка при удалении данных:', error);
    throw error;
  }
}

export async function createTestUser(supabase: ReturnType<typeof createClient>, testData: TestUserData) {
  console.log('👤 Создаем тестового пользователя:', testData);
  
  try {
    // Проверяем существование в auth.users
    console.log('🔍 Проверяем существование в auth.users...');
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers({
      filter: {
        email: testData.email.toLowerCase()
      }
    });

    if (getUserError) {
      console.error('❌ Ошибка проверки в auth.users:', getUserError);
      throw getUserError;
    }

    // Если пользователь существует - удаляем его
    if (users?.length > 0) {
      console.log('⚠️ Пользователь уже существует, удаляем...');
      await deleteUserData(supabase, users[0].id);
    }

    // Создаем нового пользователя
    const newUser = await createAuthUser(supabase, testData);

    // Создаем профиль
    await createUserProfile(supabase, {
      id: newUser.id,
      first_name: testData.firstName,
      last_name: testData.lastName,
      main_phone: testData.phone
    });

    console.log('✅ Тестовый пользователь успешно создан:', {
      id: newUser.id,
      email: newUser.email
    });

    return newUser;
  } catch (error) {
    console.error('❌ Критическая ошибка при создании пользователя:', error);
    throw error;
  }
}