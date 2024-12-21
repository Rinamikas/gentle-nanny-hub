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

    const { id } = await req.json()
    console.log("Attempting to delete user:", id)

    // Проверяем существование пользователя в auth.users
    const { data: authUser, error: authCheckError } = await supabase.auth.admin.getUserById(id)
    
    if (authCheckError || !authUser.user) {
      console.error("User not found in auth.users:", authCheckError || "No user data")
      throw new Error("User not found")
    }

    // Удаляем пользователя из auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError) {
      console.error("Error deleting from auth.users:", authError)
      throw authError
    }

    console.log("Successfully deleted user from auth.users")

    // Удаляем связанные записи
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) {
      console.error("Error deleting from profiles:", profileError)
      throw profileError
    }

    console.log("Successfully deleted user profile")

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Delete user error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})