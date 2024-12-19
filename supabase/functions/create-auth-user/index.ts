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

    console.log("Creating/updating user with email:", email)
    
    // Генерируем случайный пароль
    const generatePassword = () => {
      const length = 8;
      const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
      let password = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      return password;
    };

    const password = generatePassword();
    console.log("Generated password:", password);
    
    // Проверяем существующего пользователя
    const { data: { users }, error: searchError } = await supabaseAdmin.auth.admin.listUsers()

    if (searchError) {
      console.error("Error searching for user:", searchError)
      throw searchError
    }

    console.log("Found users:", users.length)

    const existingUser = users.find(u => u.email === email)
    let userId

    if (existingUser) {
      console.log("User exists, updating password")
      
      // Обновляем существующего пользователя
      const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { 
          password,
          email_confirmed: true
        }
      )
      
      if (updateError) {
        console.error("Error updating user:", updateError)
        throw updateError
      }

      console.log("User updated successfully:", existingUser.id)
      userId = existingUser.id
      
    } else {
      console.log("Creating new user")
      
      // Создаем нового пользователя
      const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirmed: true
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

    // Добавляем задержку для синхронизации
    await new Promise(resolve => setTimeout(resolve, 2000))

    return new Response(
      JSON.stringify({ 
        id: userId,
        password
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