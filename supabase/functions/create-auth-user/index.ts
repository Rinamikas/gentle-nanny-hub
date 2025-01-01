import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  email: string
  code: string
  shouldSignIn?: boolean
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
          persistSession: false,
        },
      }
    )

    const { email, code, shouldSignIn = false } = await req.json() as RequestBody
    console.log('Creating/updating user:', { email })

    // 1. Проверяем существование пользователя
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email.toLowerCase()
      }
    })

    if (getUserError) {
      console.error('Error checking user:', getUserError)
      throw new Error('Failed to check existing user')
    }

    let userId: string

    if (users && users.length > 0) {
      // Пользователь существует - обновляем пароль
      console.log('User exists, updating password...')
      const user = users[0]
      userId = user.id

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: code }
      )

      if (updateError) {
        console.error('Error updating user:', updateError)
        throw updateError
      }
      console.log('Password updated successfully')

    } else {
      // Создаем нового пользователя
      console.log('Creating new user...')
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password: code,
        email_confirm: true
      })

      if (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }

      if (!newUser?.user) {
        throw new Error('User creation failed')
      }

      userId = newUser.user.id
      console.log('User created successfully')
    }

    // Создаем сессию если нужно
    let session = null
    if (shouldSignIn) {
      console.log('Creating session...')
      const { data: { session: newSession }, error: signInError } = await supabaseAdmin.auth.admin
        .createSession({ userId })

      if (signInError) {
        console.error('Error creating session:', signInError)
        throw signInError
      }

      session = newSession
      console.log('Session created successfully')
    }

    return new Response(
      JSON.stringify({
        id: userId,
        session
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})