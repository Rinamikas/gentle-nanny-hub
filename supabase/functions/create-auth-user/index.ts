import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('Loading create-auth-user function...')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Создаем Supabase клиент с сервисной ролью
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

    // Получаем данные из запроса
    const { email, code } = await req.json()
    console.log('Received request for email:', email)

    try {
      // Проверяем существующих пользователей
      console.log('Checking existing users...')
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin
        .listUsers()

      if (listError) {
        console.error('Error listing users:', listError)
        throw listError
      }

      const existingUser = existingUsers.users.find(u => u.email === email)
      
      // Генерируем случайный пароль
      const password = code

      if (existingUser) {
        console.log('User exists, updating password...')
        const { data, error: updateError } = await supabaseAdmin.auth.admin
          .updateUserById(existingUser.id, { password })

        if (updateError) {
          console.error('Error updating user:', updateError)
          throw updateError
        }

        return new Response(
          JSON.stringify({ password }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Creating new user...')
      const { data, error: createError } = await supabaseAdmin.auth.admin
        .createUser({
          email,
          password,
          email_confirm: true
        })

      if (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }

      return new Response(
        JSON.stringify({ password }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('Error in user management:', error)
      throw error
    }

  } catch (error) {
    console.error('Fatal error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})