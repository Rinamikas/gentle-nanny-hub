import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Тестовые данные
const testUsers = [
  {
    email: 'test1@example.com',
    firstName: 'Test',
    lastName: 'User1',
    phone: '+79001234567'
  },
  {
    email: 'test2@example.com', 
    firstName: 'Test',
    lastName: 'User2',
    phone: '+79001234568'
  }
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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
    )

    console.log('🔵 Начинаем тестирование create-user...')
    const results = []

    for (const userData of testUsers) {
      console.log(`\n🔍 Тестируем создание пользователя: ${userData.email}`)
      
      // 1. Проверяем существование пользователя
      console.log('1️⃣ Проверяем существование пользователя...')
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        filter: {
          email: userData.email.toLowerCase()
        }
      })
      
      if (listError) {
        console.error('❌ Ошибка при проверке пользователя:', listError)
        results.push({
          email: userData.email,
          stage: 'check_existing',
          success: false,
          error: listError
        })
        continue
      }

      // Если пользователь существует - удаляем его
      if (existingUsers?.users?.length > 0) {
        console.log('🗑️ Удаляем существующего пользователя...')
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
          existingUsers.users[0].id
        )
        
        if (deleteError) {
          console.error('❌ Ошибка при удалении пользователя:', deleteError)
          results.push({
            email: userData.email,
            stage: 'delete_existing',
            success: false,
            error: deleteError
          })
          continue
        }
      }

      // 2. Создаем пользователя
      console.log('2️⃣ Создаем нового пользователя...')
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email.toLowerCase(),
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
      })

      if (createError) {
        console.error('❌ Ошибка при создании пользователя:', createError)
        results.push({
          email: userData.email,
          stage: 'create_user',
          success: false,
          error: createError
        })
        continue
      }

      // 3. Проверяем созданного пользователя
      if (!newUser?.user) {
        console.error('❌ Пользователь создан, но данные отсутствуют')
        results.push({
          email: userData.email,
          stage: 'verify_user',
          success: false,
          error: 'No user data returned'
        })
        continue
      }

      console.log('✅ Пользователь успешно создан:', {
        id: newUser.user.id,
        email: newUser.user.email,
        metadata: newUser.user.user_metadata
      })

      results.push({
        email: userData.email,
        stage: 'complete',
        success: true,
        userId: newUser.user.id
      })
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Test failed',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})