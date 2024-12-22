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

    // 1. Проверяем код верификации через RPC
    console.log('1. Checking verification code...')
    const { data: hasValidCode, error: rpcError } = await supabaseAdmin
      .rpc('check_verification_code', {
        p_email: email,
        p_code: code
      })

    if (rpcError) {
      console.error('Verification code check error:', rpcError)
      throw new Error('Failed to verify code')
    }

    if (!hasValidCode) {
      console.error('Invalid or expired verification code')
      throw new Error('Invalid or expired verification code')
    }

    console.log('2. Verification code is valid')

    // 2. Проверяем существование пользователя через getUser
    console.log('3. Checking for existing user...')
    const { data: { user: existingUser }, error: getUserError } = await supabaseAdmin.auth.admin
      .getUserByEmail(email)

    if (getUserError && getUserError.status !== 404) {
      console.error('Error checking existing user:', getUserError)
      throw new Error('Failed to check existing user')
    }

    console.log('Existing user check result:', existingUser ? 'Found' : 'Not found')

    let userId: string

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
      .eq('email', email)
      .eq('code', code)

    if (updateCodeError) {
      console.error('Error updating verification code:', updateCodeError)
      // Не прерываем процесс, так как пользователь уже создан/обновлен
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