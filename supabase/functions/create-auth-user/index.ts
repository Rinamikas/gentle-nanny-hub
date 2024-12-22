import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('Loading create-auth-user function...')

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

    const { email, code } = await req.json()
    console.log('=== Starting user management process ===')
    console.log('Email:', email)

    try {
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

      // 2. Проверяем существование пользователя
      console.log('3. Checking for existing user...')
      const { data: existingData, error: existingError } = await supabaseAdmin.auth.admin
        .listUsers()

      if (existingError) {
        console.error('Error checking existing users:', existingError)
        throw new Error('Failed to check existing users')
      }

      const existingUser = existingData.users.find(u => u.email === email)
      console.log('Existing user found:', existingUser?.id || 'none')

      let userId

      if (existingUser) {
        // 3. Обновляем существующего пользователя
        console.log('4a. Updating existing user...')
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin
          .updateUserById(existingUser.id, {
            password: code,
            email_confirm: true,
            user_metadata: { email_verified: true }
          })

        if (updateError) {
          console.error('Error updating user:', updateError)
          throw new Error('Failed to update user')
        }

        userId = existingUser.id
        console.log('5a. User updated successfully:', userId)
      } else {
        // 4. Создаем нового пользователя
        console.log('4b. Creating new user...')
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin
          .createUser({
            email,
            password: code,
            email_confirm: true,
            user_metadata: { email_verified: true }
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

      // 5. Обновляем статус кода верификации
      console.log('6. Updating verification code status...')
      const { error: updateCodeError } = await supabaseAdmin
        .from('verification_codes')
        .update({ status: 'verified' })
        .eq('id', codes[0].id)

      if (updateCodeError) {
        console.error('Error updating verification code:', updateCodeError)
        // Не прерываем процесс, так как пользователь уже создан/обновлен
      }

      // 6. Добавляем задержку перед возвратом результата
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

    } catch (error: any) {
      console.error('=== Error in user management ===')
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        status: error.status,
        stack: error.stack
      })
      
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('=== Fatal error ===', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})