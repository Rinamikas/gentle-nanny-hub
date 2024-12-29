import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { deleteUserData, createTestUser } from "./db-operations.ts";
import { TestUserData } from "./types.ts";

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
    const testData = await req.json() as TestUserData;
    console.log('📝 Тестовые данные:', testData);

    // Проверяем обязательные поля
    if (!testData.email || !testData.firstName || !testData.lastName || !testData.phone) {
      console.error('❌ Не все обязательные поля заполнены');
      throw new Error('Не все обязательные поля заполнены');
    }

    // Создаем нового пользователя
    const newUser = await createTestUser(supabaseAdmin, testData);

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