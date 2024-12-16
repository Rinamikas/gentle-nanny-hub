import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase_supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password } = await req.json()

    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    // 1. Проверяем существует ли пользователь
    console.log("1. Checking if user exists:", email)
    const { data: existingUsers, error: searchError } = await supabaseClient.auth.admin.listUsers({
      filter: {
        email: email
      }
    })

    if (searchError) {
      throw searchError
    }

    // 2. Если пользователь существует - обновляем его пароль
    if (existingUsers.users.length > 0) {
      console.log("2. User exists, updating password")
      const { data: updateData, error: updateError } = await supabaseClient.auth.admin.updateUserById(
        existingUsers.users[0].id,
        { password }
      )

      if (updateError) {
        throw updateError
      }

      return new Response(
        JSON.stringify(updateData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // 3. Если пользователя нет - создаем нового
    console.log("3. Creating new user")
    const { data: userData, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (createError) {
      throw createError
    }

    return new Response(
      JSON.stringify(userData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error("Error in create-user function:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})