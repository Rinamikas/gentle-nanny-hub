import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    
    console.log("Creating user with data:", { 
      email: normalizedEmail, 
      firstName, 
      lastName, 
      phone 
    })

    // Генерируем случайный пароль для пользователя
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

    try {
      // Создаем пользователя через auth.admin API
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
        console.error("Error creating auth user:", createError)
        throw new Error(`Database error creating new user: ${createError.message}`)
      }

      if (!newUser?.user) {
        console.error("No user data returned after creation")
        throw new Error("Failed to create user - no data returned")
      }

      console.log("Auth user created successfully:", newUser.user.id)

      return new Response(
        JSON.stringify({ 
          id: newUser.user.id,
          email: normalizedEmail
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    } catch (createError) {
      console.error("Error in user creation:", createError)
      throw new Error(`Failed to create user: ${createError.message}`)
    }

  } catch (error) {
    console.error("Create user error:", error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error creating user"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})