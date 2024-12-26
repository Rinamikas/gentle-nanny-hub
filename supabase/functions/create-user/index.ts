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

    // Генерируем пароль
    const password = Math.random().toString(36).slice(-8)

    try {
      console.log("Attempting to create new user...")
      
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
        console.log("Create user error:", createError)
        
        // Если пользователь уже существует, получаем его данные
        if (createError.message.includes('User already registered')) {
          console.log("User exists, fetching details...")
          
          const { data: { users }, error: listError } = await supabaseClient.auth.admin
            .listUsers({
              filter: {
                email: normalizedEmail
              }
            })

          if (listError) {
            console.error("Error fetching existing user:", listError)
            throw listError
          }

          if (!users?.length) {
            throw new Error("Failed to fetch existing user")
          }

          console.log("Returning existing user:", users[0].id)
          return new Response(
            JSON.stringify({ 
              id: users[0].id,
              email: normalizedEmail,
              exists: true
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        }
        
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
          email: normalizedEmail,
          exists: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } catch (error) {
      console.error("Detailed error in user creation:", {
        error,
        message: error.message,
        stack: error.stack
      })
      
      throw error
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
        status: error.status || 500
      }
    )
  }
})