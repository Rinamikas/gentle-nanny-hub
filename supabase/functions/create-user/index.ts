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

    console.log("Creating/updating user with email:", email)

    // Проверяем существует ли пользователь
    const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email
      }
    })

    if (searchError) {
      console.error("Error searching for user:", searchError)
      throw searchError
    }

    let userId

    if (existingUsers.users.length > 0) {
      // Если пользователь существует, просто получаем его id
      console.log("User exists, getting id")
      userId = existingUsers.users[0].id
    } else {
      // Если пользователь не существует, создаем нового
      console.log("User doesn't exist, creating new user")
      const { data: { user }, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true
      })

      if (createError) {
        console.error("Error creating user:", createError)
        throw createError
      }
      if (!user) {
        throw new Error('Failed to create user')
      }
      
      userId = user.id
    }

    console.log("Operation successful, returning user id:", userId)

    return new Response(
      JSON.stringify({ id: userId }),
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