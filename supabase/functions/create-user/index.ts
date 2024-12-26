import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, firstName, lastName, phone } = await req.json()
    
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required and must be a string')
    }

    const normalizedEmail = email.toLowerCase().trim()
    
    console.log("Starting user creation process for:", normalizedEmail)

    // Сначала проверяем существование пользователя
    const { data: existingUser, error: getUserError } = await supabaseClient.auth.admin
      .getUserByEmail(normalizedEmail)

    if (getUserError && !getUserError.message.includes('User not found')) {
      console.error("Error checking existing user:", getUserError)
      throw getUserError
    }

    if (existingUser) {
      console.log("User already exists:", existingUser.id)
      return new Response(
        JSON.stringify({ 
          error: "User already exists",
          id: existingUser.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409
        }
      )
    }

    // Генерируем пароль
    const password = Array(3)
      .fill(0)
      .map(() => Math.random().toString(36).slice(-8))
      .join('')

    console.log("Creating new user with email:", normalizedEmail)
    
    const { data: newUser, error: createError } = await supabaseClient.auth.admin
      .createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { 
          first_name: firstName, 
          last_name: lastName,
          phone,
          email_verified: true
        }
      })

    if (createError) {
      console.error("Error creating user:", {
        message: createError.message,
        status: createError.status,
        name: createError.name
      })
      throw createError
    }

    if (!newUser?.user) {
      throw new Error("User creation failed - no data returned")
    }

    console.log("User created successfully:", {
      id: newUser.user.id,
      email: normalizedEmail
    })

    return new Response(
      JSON.stringify({ 
        id: newUser.user.id,
        email: normalizedEmail
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error("Error in user creation:", {
      name: error.name,
      message: error.message,
      status: error.status,
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({ 
        error: "Error processing request",
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 500
      }
    )
  }
})