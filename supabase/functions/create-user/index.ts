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

    console.log("Creating/checking user with email:", email)

    // Проверяем существование пользователя
    const { data: existingUser, error: getUserError } = await supabaseClient.auth.admin
      .listUsers()

    const userExists = existingUser?.users.find(u => u.email === email)

    if (userExists) {
      console.log("User already exists:", userExists.id)
      return new Response(
        JSON.stringify({ id: userExists.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Создаем нового пользователя
    const { data: newUser, error: createError } = await supabaseClient.auth.admin
      .createUser({
        email,
        email_confirm: true,
        user_metadata: { firstName, lastName, phone }
      })

    if (createError) {
      throw createError
    }

    console.log("New user created:", newUser.user.id)

    return new Response(
      JSON.stringify({ id: newUser.user.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})