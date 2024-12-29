import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

export async function deleteUserData(supabase: ReturnType<typeof createClient>, userId: string) {
  console.log('🗑️ Начинаем удаление данных пользователя:', userId);
  
  try {
    // 1. Удаляем данные из children
    console.log('1️⃣ Удаляем данные children...');
    const { error: deleteChildrenError } = await supabase
      .from('children')
      .delete()
      .eq('parent_profile_id', userId);

    if (deleteChildrenError) {
      console.error('❌ Ошибка удаления children:', deleteChildrenError);
      throw deleteChildrenError;
    }
    console.log('✅ Данные children удалены');

    // 2. Удаляем данные из parent_profiles
    console.log('2️⃣ Удаляем данные parent_profiles...');
    const { error: deleteParentError } = await supabase
      .from('parent_profiles')
      .delete()
      .eq('user_id', userId);

    if (deleteParentError) {
      console.error('❌ Ошибка удаления parent_profiles:', deleteParentError);
      throw deleteParentError;
    }
    console.log('✅ Данные parent_profiles удалены');

    // 3. Проверяем и удаляем данные из nanny_profiles
    console.log('3️⃣ Проверяем данные nanny_profiles...');
    const { data: nannyProfile } = await supabase
      .from('nanny_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (nannyProfile) {
      console.log('🧹 Найден профиль няни, удаляем связанные данные...');
      // Удаляем связанные с няней данные
      const tables = [
        'appointments',
        'nanny_training',
        'nanny_documents',
        'working_hours',
        'schedule_events',
        'nanny_settings'
      ];

      for (const table of tables) {
        console.log(`🗑️ Удаляем данные из ${table}...`);
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('nanny_id', nannyProfile.id);

        if (error) {
          console.error(`❌ Ошибка удаления данных из ${table}:`, error);
          throw error;
        }
        console.log(`✅ Данные из ${table} удалены`);
      }

      // Удаляем профиль няни
      console.log('🗑️ Удаляем профиль няни...');
      const { error: deleteNannyError } = await supabase
        .from('nanny_profiles')
        .delete()
        .eq('user_id', userId);

      if (deleteNannyError) {
        console.error('❌ Ошибка удаления nanny_profiles:', deleteNannyError);
        throw deleteNannyError;
      }
      console.log('✅ Данные nanny_profiles удалены');
    }

    // 4. Удаляем роли пользователя
    console.log('4️⃣ Удаляем роли пользователя...');
    const { error: deleteRolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteRolesError) {
      console.error('❌ Ошибка удаления ролей:', deleteRolesError);
      throw deleteRolesError;
    }
    console.log('✅ Роли пользователя удалены');

    // 5. Удаляем профиль
    console.log('5️⃣ Удаляем профиль...');
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (deleteProfileError) {
      console.error('❌ Ошибка удаления профиля:', deleteProfileError);
      throw deleteProfileError;
    }
    console.log('✅ Профиль пользователя удален');

    return true;
  } catch (error) {
    console.error('❌ Ошибка при удалении данных:', error);
    throw error;
  }
}

export async function createTestUser(supabase: ReturnType<typeof createClient>, testData: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}) {
  console.log('👤 Создаем тестового пользователя:', testData);
  
  try {
    // Генерируем случайный пароль
    const password = Math.random().toString(36).slice(-8);
    
    console.log('🔑 Создаем пользователя через Admin API...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testData.email.toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: testData.firstName,
        last_name: testData.lastName,
        phone: testData.phone
      },
      app_metadata: {
        provider: 'email',
        providers: ['email']
      }
    });

    if (createError) {
      console.error('❌ Ошибка создания пользователя:', createError);
      throw createError;
    }

    if (!newUser?.user) {
      console.error('❌ Пользователь не создан - нет данных');
      throw new Error('User creation failed - no data returned');
    }

    console.log('✅ Пользователь успешно создан:', {
      id: newUser.user.id,
      email: newUser.user.email
    });

    return newUser.user;
  } catch (error) {
    console.error('❌ Критическая ошибка при создании пользователя:', error);
    throw error;
  }
}