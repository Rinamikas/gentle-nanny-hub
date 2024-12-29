import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { TestUserData } from './types.ts';

export async function deleteAuthUser(supabase: ReturnType<typeof createClient>, userId: string) {
  console.log('🗑️ Удаляем пользователя из auth.users:', userId);
  const { error } = await supabase.auth.admin.deleteUser(userId);
  
  if (error) {
    console.error('❌ Ошибка удаления из auth.users:', error);
    throw error;
  }
  
  console.log('✅ Пользователь удален из auth.users');
}

export async function createAuthUser(supabase: ReturnType<typeof createClient>, userData: TestUserData) {
  const password = Math.random().toString(36).slice(-8);
  
  console.log('🔑 Создаем пользователя через Admin API...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: userData.email.toLowerCase(),
    password: password,
    email_confirm: true,
    user_metadata: {
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone
    },
    app_metadata: {
      provider: 'email',
      providers: ['email']
    }
  });

  if (error) {
    console.error('❌ Ошибка создания пользователя:', error);
    throw error;
  }

  if (!data?.user) {
    console.error('❌ Пользователь не создан - нет данных');
    throw new Error('User creation failed - no data returned');
  }

  console.log('✅ Пользователь создан в auth.users:', data.user.id);
  return data.user;
}