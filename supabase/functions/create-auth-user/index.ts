import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, userData } = await req.json()
    console.log("Creating auth user with email:", email)

    // Создаем пользователя в auth.users
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: password || Math.random().toString(36).slice(-8), // Генерируем случайный пароль если не передан
      email_confirm: true,
      user_metadata: userData
    })

    if (createError) {
      console.error("Error creating auth user:", createError)
      throw createError
    }

    console.log("Successfully created auth user:", authData.user.id)

    return new Response(
      JSON.stringify({ user: authData.user }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error("Create auth user error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})