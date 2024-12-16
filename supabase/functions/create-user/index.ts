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

    const { email, password } = await req.json()

    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    // Проверяем существует ли пользователь
    const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email
      }
    })

    if (searchError) throw searchError

    let userId

    if (existingUsers.users.length > 0) {
      // Если пользователь существует, обновляем пароль
      const user = existingUsers.users[0]
      userId = user.id

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: password }
      )

      if (updateError) throw updateError
    } else {
      // Если пользователь не существует, создаем нового
      const { data: { user }, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
      })

      if (createError) throw createError
      if (!user) throw new Error('Failed to create user')
      
      userId = user.id
    }

    return new Response(
      JSON.stringify({ id: userId }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})