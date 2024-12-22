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

    const { id, updates } = await req.json()
    console.log("Attempting to update user:", { id, updates })

    // Сначала проверяем существование пользователя
    const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(id)
    
    if (getUserError) {
      console.error("Error getting user:", getUserError)
      throw new Error(`Failed to get user: ${getUserError.message}`)
    }
    
    if (!user) {
      console.error("User not found with ID:", id)
      throw new Error(`User not found with ID: ${id}`)
    }

    console.log("Found user:", user.id)

    // Проверяем, не занят ли email другим пользователем
    if (updates.email && updates.email !== user.email) {
      const { data: existingUser, error: emailCheckError } = await supabase.auth.admin.listUsers()
      
      if (emailCheckError) {
        console.error("Error checking email:", emailCheckError)
        throw emailCheckError
      }

      const emailExists = existingUser.users.some(u => 
        u.email === updates.email && u.id !== id
      )

      if (emailExists) {
        throw new Error(`Email ${updates.email} is already taken`)
      }
    }

    // Обновляем данные в auth.users
    const { data: authData, error: updateError } = await supabase.auth.admin.updateUserById(
      id,
      {
        email: updates.email,
        user_metadata: {
          first_name: updates.first_name,
          last_name: updates.last_name
        }
      }
    )

    if (updateError) {
      console.error("Error updating auth user:", updateError)
      throw updateError
    }

    console.log("Successfully updated auth user")

    // Обновляем профиль
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        email: updates.email,
        first_name: updates.first_name,
        last_name: updates.last_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (profileError) {
      console.error("Error updating profile:", profileError)
      throw profileError
    }

    console.log("Successfully updated user profile")

    return new Response(
      JSON.stringify({ user: authData.user }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error("Update user error:", error.message)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})