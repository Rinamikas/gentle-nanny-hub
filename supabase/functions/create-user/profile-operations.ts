import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { UserProfile } from './types.ts';

export async function createUserProfile(supabase: ReturnType<typeof createClient>, profile: UserProfile) {
  console.log('📝 Создаем запись в profiles...', profile);
  
  const { error } = await supabase
    .from('profiles')
    .insert(profile);

  if (error) {
    console.error('❌ Ошибка создания профиля:', error);
    throw error;
  }

  console.log('✅ Профиль создан успешно');
}

export async function deleteUserProfile(supabase: ReturnType<typeof createClient>, userId: string) {
  console.log('🗑️ Удаляем профиль пользователя:', userId);
  
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('❌ Ошибка удаления профиля:', error);
    throw error;
  }

  console.log('✅ Профиль удален успешно');
}