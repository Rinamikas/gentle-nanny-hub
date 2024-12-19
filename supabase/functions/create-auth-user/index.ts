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

    const { email, code } = await req.json()

    if (!email || !code) {
      throw new Error('Email and code are required')
    }

    console.log("Checking existing user for email:", email)
    
    // Проверяем существующего пользователя
    const { data: { users }, error: searchError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email
      }
    })

    if (searchError) {
      console.error("Error searching for user:", searchError)
      throw searchError
    }

    let userId

    if (users && users.length > 0) {
      // Обновляем существующего пользователя
      console.log("Updating existing user with id:", users[0].id)
      const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        users[0].id,
        { 
          password: code,
          email_confirm: true
        }
      )
      
      if (updateError) {
        console.error("Error updating user:", updateError)
        throw updateError
      }
      
      userId = users[0].id
      console.log("User updated successfully:", userId)
      
    } else {
      // Создаем нового пользователя
      console.log("Creating new user with email:", email)
      const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: code,
        email_confirm: true
      })

      if (createError) {
        console.error("Error creating user:", createError)
        throw createError
      }

      if (!data.user) {
        throw new Error('Failed to create user')
      }

      userId = data.user.id
      console.log("User created successfully:", userId)
    }

    // Добавляем задержку для синхронизации
    await new Promise(resolve => setTimeout(resolve, 1000))

    return new Response(
      JSON.stringify({ 
        id: userId,
        password: code
      }),
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