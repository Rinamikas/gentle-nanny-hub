import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Создаем клиент с service_role ключом
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

    const { email, code, shouldSignIn = false } = await req.json()
    console.log('=== Starting user management process ===')
    console.log('Email:', email)
    console.log('Code:', code)
    console.log('Should Sign In:', shouldSignIn)

    // 1. Проверяем существование пользователя через auth.users
    console.log('1. Checking for existing user in auth.users...')
    
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email.toLowerCase()
      }
    })

    if (getUserError) {
      console.error('Error checking users:', getUserError)
      throw new Error('Failed to check existing users')
    }

    console.log('Users search result:', users)

    let userId: string

    if (users && users.length > 0) {
      // Пользователь существует
      console.log('2a. User exists, getting user directly...')
      
      const user = users[0]
      userId = user.id

      console.log('Found user:', userId)
      
      // Обновляем пароль
      const { error: updateError } = await supabaseAdmin.auth.admin
        .updateUserById(userId, {
          password: code,
          email_confirm: true,
        })

      if (updateError) {
        console.error('Error updating user:', updateError)
        throw updateError
      }

      console.log('3a. User password updated successfully:', userId)
    } else {
      // Создаем нового пользователя
      console.log('2b. Creating new user...')
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin
        .createUser({
          email,
          password: code,
          email_confirm: true,
        })

      if (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }

      if (!createData.user) {
        console.error('No user data returned after creation')
        throw new Error('Failed to create user')
      }

      userId = createData.user.id
      console.log('3b. User created successfully:', userId)
    }

    // Если нужно выполнить вход, возвращаем пароль
    const response: { id: string; password?: string } = { id: userId }
    if (shouldSignIn) {
      response.password = code
    }

    console.log('=== User management process completed successfully ===')

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('=== Error in user management ===')
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to manage user' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})