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

    const { email, code } = await req.json()
    console.log('=== Starting user management process ===')
    console.log('Email:', email)
    console.log('Code:', code)

    // 1. Проверяем существование пользователя через profiles
    console.log('1. Checking for existing user in profiles...')
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (profileError) {
      console.error('Error checking profile:', profileError)
      throw new Error('Failed to check existing profile')
    }

    console.log('Profile search result:', profile)

    let userId: string

    if (profile) {
      // 2a. Если профиль существует, ищем пользователя по email
      console.log('2a. Profile exists, searching for user...')
      
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()

      if (listError) {
        console.error('Error listing users:', listError)
        throw new Error('Failed to list users')
      }

      const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

      if (user) {
        console.log('Found user in auth.users:', user.id)
        // Обновляем пароль
        const { error: updateError } = await supabaseAdmin.auth.admin
          .updateUserById(user.id, {
            password: code,
            email_confirm: true
          })

        if (updateError) {
          console.error('Error updating user:', updateError)
          throw new Error('Failed to update user')
        }

        userId = user.id
        console.log('3a. User password updated successfully:', userId)
      } else {
        console.error('User not found in auth.users despite having a profile')
        throw new Error('Inconsistent user state')
      }
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