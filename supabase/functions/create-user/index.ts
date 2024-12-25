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
    
    console.log("Creating user with data:", { email, firstName, lastName, phone })

    // Генерируем случайный пароль для пользователя
    const password = Math.random().toString(36).slice(-8)

    // Создаем пользователя через auth.admin API
    const { data: newUser, error: createError } = await supabaseClient.auth.admin
      .createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { 
          firstName, 
          lastName,
          phone
        }
      })

    if (createError) {
      console.error("Error creating auth user:", createError)
      throw createError
    }

    console.log("Auth user created successfully:", newUser.user.id)

    return new Response(
      JSON.stringify({ 
        id: newUser.user.id,
        email: newUser.user.email
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error("Create user error:", error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Error creating user",
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})