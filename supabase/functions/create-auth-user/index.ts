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

    // Генерируем пароль
    const password = Math.random().toString(36).slice(-8)
    console.log("Generated password:", password)

    // Проверяем существует ли пользователь
    const { data: { users }, error: searchError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email
      }
    })

    if (searchError) {
      console.error("Error searching for user:", searchError)
      throw searchError
    }

    console.log("Found users:", users?.length)

    let userId

    if (users && users.length > 0) {
      // Если пользователь существует, обновляем пароль
      console.log("User exists, updating password")
      const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        users[0].id,
        { 
          password,
          email_confirm: true,
          user_metadata: {
            email_confirmed: true
          }
        }
      )
      if (updateError) {
        console.error("Error updating user:", updateError)
        throw updateError
      }
      console.log("User updated successfully:", data?.user?.id)
      userId = users[0].id
    } else {
      // Если пользователь не существует, создаем нового
      console.log("User doesn't exist, creating new user")
      const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          email_confirmed: true
        }
      })

      if (createError) {
        console.error("Error creating user:", createError)
        throw createError
      }
      if (!data.user) {
        throw new Error('Failed to create user')
      }
      
      console.log("User created successfully:", data.user.id)
      userId = data.user.id
    }

    console.log("Operation successful, returning user id:", userId)

    return new Response(
      JSON.stringify({ 
        id: userId, 
        password,
        success: true 
      }),
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
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})