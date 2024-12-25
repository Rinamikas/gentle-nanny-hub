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
    
    console.log("Creating user with data:", { 
      email: normalizedEmail, 
      firstName, 
      lastName, 
      phone 
    })

    try {
      // Проверяем существование пользователя
      const { data: existingUsers } = await supabaseClient.auth.admin.listUsers({
        filter: {
          email: normalizedEmail
        }
      })

      if (existingUsers?.users?.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: "User already exists",
            id: existingUsers.users[0].id
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 409 
          }
        )
      }

      // Генерируем более надежный пароль
      const password = Math.random().toString(36).slice(-8) + 
                      Math.random().toString(36).slice(-8) + 
                      Math.random().toString(36).slice(-8)

      console.log("Attempting to create user with auth.admin.createUser...")
      
      const { data: newUser, error: createError } = await supabaseClient.auth.admin
        .createUser({
          email: normalizedEmail,
          password: password,
          email_confirm: true,
          user_metadata: { 
            first_name: firstName, 
            last_name: lastName,
            phone,
            email_verified: true
          }
        })

      if (createError) {
        console.error("Error details from auth.admin.createUser:", {
          message: createError.message,
          status: createError.status,
          name: createError.name
        })
        throw createError
      }

      if (!newUser?.user) {
        console.error("No user data returned after creation")
        throw new Error("Failed to create user - no data returned")
      }

      console.log("User created successfully:", {
        id: newUser.user.id,
        email: newUser.user.email,
        created_at: newUser.user.created_at
      })

      return new Response(
        JSON.stringify({ 
          id: newUser.user.id,
          email: normalizedEmail
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: 200
        }
      )
    } catch (createError) {
      console.error("Detailed error in user creation:", {
        error: createError,
        message: createError.message,
        stack: createError.stack
      })
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to create user",
          details: createError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

  } catch (error) {
    console.error("Top level error:", {
      error,
      message: error.message,
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({ 
        error: "Error processing request",
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})