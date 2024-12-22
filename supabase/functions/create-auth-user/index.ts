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

    // 1. Проверяем код верификации
    console.log('1. Checking verification code...')
    const { data: codes, error: codeError } = await supabaseAdmin
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (codeError) {
      console.error('Verification code check error:', codeError)
      throw new Error('Failed to verify code')
    }

    if (!codes || codes.length === 0) {
      console.error('Invalid or expired verification code')
      throw new Error('Invalid or expired verification code')
    }

    console.log('2. Verification code is valid')

    // 2. Проверяем существование пользователя через listUsers
    console.log('3. Checking for existing user...')
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin
      .listUsers({
        filter: {
          email: email
        }
      })

    if (getUserError) {
      console.error('Error checking existing users:', getUserError)
      throw new Error('Failed to check existing users')
    }

    const existingUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
    console.log('Existing user found:', existingUser?.id || 'none')

    let userId

    if (existingUser) {
      // 3a. Обновляем пароль существующего пользователя
      console.log('4a. Updating existing user password...')
      const { error: updateError } = await supabaseAdmin.auth.admin
        .updateUserById(existingUser.id, {
          password: code,
          email_confirm: true
        })

      if (updateError) {
        console.error('Error updating user:', updateError)
        throw new Error('Failed to update user')
      }

      userId = existingUser.id
      console.log('5a. User password updated successfully:', userId)
    } else {
      // 3b. Создаем нового пользователя
      console.log('4b. Creating new user...')
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
      console.log('5b. User created successfully:', userId)
    }

    // 4. Обновляем статус кода верификации
    console.log('6. Updating verification code status...')
    const { error: updateCodeError } = await supabaseAdmin
      .from('verification_codes')
      .update({ status: 'verified' })
      .eq('id', codes[0].id)

    if (updateCodeError) {
      console.error('Error updating verification code:', updateCodeError)
      // Не прерываем процесс, так как пользователь уже создан/обновлен
    }

    // 5. Добавляем задержку перед возвратом результата
    await new Promise(resolve => setTimeout(resolve, 2000))

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
    console.error('Error details:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create user' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})