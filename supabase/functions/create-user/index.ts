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
    
    console.log("Checking if user exists for email:", normalizedEmail)

    // Получаем список всех пользователей и фильтруем вручную
    const { data: { users }, error: listError } = await supabaseClient.auth.admin.listUsers()

    if (listError) {
      console.error("Error getting users list:", listError)
      throw listError
    }

    // Ищем пользователя с нужным email
    const existingUser = users.find(user => user.email?.toLowerCase() === normalizedEmail)

    // Если пользователь существует - возвращаем его данные
    if (existingUser) {
      console.log("Found existing user:", existingUser.email)
      return new Response(
        JSON.stringify({ 
          id: existingUser.id,
          email: normalizedEmail,
          exists: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    console.log("No existing user found, creating new user...")
    
    try {
      // Если пользователь не существует - создаем нового
      const password = Math.random().toString(36).slice(-8)
      
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
        console.error("Error creating user:", createError)
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

      if (!newUser?.user) {
        throw new Error("User creation failed - no data returned")
      }

      console.log("Successfully created new user:", newUser.user.email)

      return new Response(
        JSON.stringify({ 
          id: newUser.user.id,
          email: normalizedEmail,
          exists: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } catch (createError) {
      console.error("Database error creating new user:", createError)
      return new Response(
        JSON.stringify({ 
          error: "Database error creating new user",
          details: createError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

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
        status: error.status || 400
      }
    )
  }
})