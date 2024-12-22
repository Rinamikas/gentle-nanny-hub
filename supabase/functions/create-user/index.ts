import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    console.log("Creating/updating user with email:", email)

    // Создаем пользователя в auth.users если его нет
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      password: Math.random().toString(36).slice(-8), // Временный пароль
    })

    if (authError) {
      // Если ошибка о том что пользователь уже существует - это нормально
      if (!authError.message.includes('User already registered')) {
        console.error("Error creating auth user:", authError)
        throw authError
      }
      
      // Получаем существующего пользователя
      const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
        filter: {
          email: email
        }
      })

      if (getUserError) {
        console.error("Error getting existing user:", getUserError)
        throw getUserError
      }

      if (!users || users.length === 0) {
        throw new Error('Failed to find existing user')
      }

      console.log("Found existing user:", users[0].id)
      return new Response(
        JSON.stringify({ id: users[0].id }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})