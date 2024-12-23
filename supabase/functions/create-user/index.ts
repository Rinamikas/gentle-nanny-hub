import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    console.log("Checking existing user with email:", email)

    // Сначала проверяем существование пользователя
    const { data: existingUsers, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email
      }
    })

    if (getUserError) {
      console.error("Error checking existing user:", getUserError)
      throw getUserError
    }

    // Если пользователь найден, возвращаем его данные
    if (existingUsers.users && existingUsers.users.length > 0) {
      const existingUser = existingUsers.users[0]
      console.log("Found existing user:", existingUser.id)
      return new Response(
        JSON.stringify({ id: existingUser.id }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log("No existing user found, creating new user...")

    // Создаем нового пользователя
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      password: Math.random().toString(36).slice(-8), // Временный пароль
    })

    if (createError) {
      console.error("Error creating user:", createError)
      throw createError
    }

    if (!authUser.user) {
      throw new Error('Failed to create user')
    }

    console.log("Created new user:", authUser.user.id)

    return new Response(
      JSON.stringify({ id: authUser.user.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error("Error in create-user function:", error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})