import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { deleteUserData, createTestUser } from "./db-operations.ts";

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

    // Проверяем обязательные поля
    if (!testData.email || !testData.firstName || !testData.lastName || !testData.phone) {
      console.error('❌ Не все обязательные поля заполнены');
      throw new Error('Не все обязательные поля заполнены');
    }

    // Проверяем существование пользователя
    console.log('🔍 Проверяем существование пользователя...');
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: testData.email.toLowerCase()
      }
    });

    if (getUserError) {
      console.error('❌ Ошибка проверки пользователя:', getUserError);
      throw getUserError;
    }

    // Если пользователь существует - удаляем его
    if (users?.length > 0) {
      console.log('🗑️ Удаляем существующего пользователя...');
      const userId = users[0].id;

      try {
        // Удаляем все связанные данные
        console.log('🧹 Начинаем удаление связанных данных...');
        await deleteUserData(supabaseAdmin, userId);
        console.log('✅ Связанные данные удалены');

        // Удаляем пользователя из auth.users
        console.log('🗑️ Удаляем пользователя из auth.users...');
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
          console.error('❌ Ошибка удаления пользователя:', deleteError);
          throw deleteError;
        }
        console.log('✅ Пользователь успешно удален из auth.users');

      } catch (error) {
        console.error('❌ Ошибка при удалении данных:', error);
        throw new Error(`Ошибка при удалении данных: ${error.message}`);
      }
    }

    // Создаем нового пользователя
    console.log('👤 Создаем нового пользователя...');
    const newUser = await createTestUser(supabaseAdmin, testData);
    console.log('✅ Новый пользователь создан:', newUser);

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email
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