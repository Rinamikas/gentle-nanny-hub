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

    // Проверяем существование пользователя
    const { data: authUser, error: authCheckError } = await supabase.auth.admin.getUserById(id)
    
    if (authCheckError || !authUser.user) {
      console.error("User not found in auth.users:", authCheckError || "No user data")
      throw new Error("User not found")
    }

    console.log("User found, proceeding with update")

    // Обновляем данные в auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      id,
      {
        email: updates.email,
        user_metadata: {
          first_name: updates.first_name,
          last_name: updates.last_name
        }
      }
    )

    if (authError) {
      console.error("Error updating auth.users:", authError)
      throw authError
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

    return new Response(JSON.stringify({ user: authData.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Update user error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})