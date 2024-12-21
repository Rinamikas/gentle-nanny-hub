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
    console.log("=== Начало процесса удаления пользователя ===")
    console.log("ID пользователя:", id)

    // Проверяем существование пользователя в auth.users
    const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(id)
    
    if (getUserError) {
      console.error("Ошибка при поиске пользователя:", getUserError)
      throw new Error("Ошибка при поиске пользователя")
    }

    if (!user) {
      console.error("Пользователь не найден в auth.users")
      throw new Error("Пользователь не найден")
    }

    console.log("Пользователь найден:", user.id)

    // Удаляем связанные записи из profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) {
      console.error("Ошибка удаления из profiles:", profileError)
      throw profileError
    }

    console.log("Профиль успешно удален")

    // Удаляем пользователя из auth.users
    const { error: deleteError } = await supabase.auth.admin.deleteUser(id)
    
    if (deleteError) {
      console.error("Ошибка удаления из auth.users:", deleteError)
      throw deleteError
    }

    console.log("Пользователь успешно удален из auth.users")

    return new Response(
      JSON.stringify({ success: true }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error("Ошибка при удалении пользователя:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})