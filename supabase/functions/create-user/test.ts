import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('🔵 Начинаем тестирование create-user...');
    
    // Получаем данные из запроса
    const testData = await req.json();
    console.log('📝 Тестовые данные:', testData);

    // Проверяем существование пользователя
    const { data: existingUsers, error: checkError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: testData.email
      }
    });

    if (checkError) {
      console.error('❌ Ошибка проверки пользователя:', checkError);
      throw checkError;
    }

    // Если пользователь существует - удаляем его
    if (existingUsers?.users?.length > 0) {
      console.log('🗑️ Удаляем существующего пользователя...');
      
      const userId = existingUsers.users[0].id;
      
      // Сначала проверяем и удаляем роли пользователя
      const { error: deleteRolesError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (deleteRolesError) {
        console.error('❌ Ошибка удаления ролей:', deleteRolesError);
        throw deleteRolesError;
      }
      
      console.log('✅ Роли пользователя удалены');

      // Затем удаляем профиль
      const { error: deleteProfileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (deleteProfileError) {
        console.error('❌ Ошибка удаления профиля:', deleteProfileError);
        throw deleteProfileError;
      }
      
      console.log('✅ Профиль пользователя удален');

      // Теперь удаляем пользователя из auth.users
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.error('❌ Ошибка удаления пользователя:', deleteError);
        throw deleteError;
      }
      
      console.log('✅ Пользователь успешно удален');
    }

    // Создаем нового пользователя
    console.log('👤 Создаем нового пользователя...');
    const password = Math.random().toString(36).slice(-8);
    
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testData.email,
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

    console.log('✅ Пользователь успешно создан:', {
      id: newUser.user.id,
      email: newUser.user.email,
      metadata: newUser.user.user_metadata
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create user',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});