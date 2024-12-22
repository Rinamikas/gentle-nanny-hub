import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase_supabase-js@2'

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

    const { email, code } = await req.json()
    console.log('=== Starting user management process ===')
    console.log('Email:', email)
    console.log('Code:', code)

    // 1. Проверяем существование пользователя через profiles
    console.log('1. Checking for existing user in profiles...')
    
    // Логируем параметры запроса
    console.log('Query params:', {
      table: 'profiles',
      select: 'id, email',
      email: email.toLowerCase()
    })

    const { data: profile, error: profileError, status, statusText } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    // Подробное логирование результата запроса
    console.log('Query response:', {
      data: profile,
      error: profileError,
      status,
      statusText
    })

    if (profileError) {
      console.error('Error checking profile:', {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details
      })
      throw new Error('Failed to check existing profile')
    }

    console.log('Profile search result:', profile)

    let userId: string

    if (profile) {
      // 2a. Если профиль существует, обновляем пароль
      console.log('2a. Profile exists, updating password...')
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin
        .updateUserById(profile.id, {
          password: code,
          email_confirm: true
        })

      if (updateError) {
        console.error('Error updating user:', {
          message: updateError.message,
          status: updateError.status
        })
        throw new Error('Failed to update user')
      }

      userId = profile.id
      console.log('3a. User password updated successfully:', userId)
    } else {
      // 2b. Создаем нового пользователя
      console.log('2b. Creating new user...')
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin
        .createUser({
          email,
          password: code,
          email_confirm: true
        })

      if (createError) {
        console.error('Error creating user:', createError)
        throw new Error('Failed to create user')
      }

      if (!createData.user) {
        console.error('No user data returned after creation')
        throw new Error('Failed to create user')
      }

      userId = createData.user.id
      console.log('3b. User created successfully:', userId)
    }

    console.log('=== User management process completed successfully ===')

    return new Response(
      JSON.stringify({ 
        password: code,
        userId: userId
      }),
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