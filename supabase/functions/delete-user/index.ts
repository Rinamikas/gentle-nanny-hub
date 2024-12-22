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

    // Получаем профиль няни, если есть
    const { data: nannyProfile } = await supabase
      .from('nanny_profiles')
      .select('id')
      .eq('user_id', id)
      .single()

    if (nannyProfile) {
      console.log("Найден профиль няни, удаляем связанные данные...")
      
      // Удаляем связанные записи для няни
      const tables = [
        'nanny_training',
        'nanny_documents',
        'working_hours',
        'schedule_events',
        'nanny_settings',
        'appointments'
      ]

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('nanny_id', nannyProfile.id)

        if (error) {
          console.error(`Ошибка при удалении данных из ${table}:`, error)
          throw error
        }
        console.log(`Удалены данные из таблицы ${table}`)
      }

      // Удаляем профиль няни
      const { error: deleteNannyError } = await supabase
        .from('nanny_profiles')
        .delete()
        .eq('user_id', id)

      if (deleteNannyError) {
        console.error("Ошибка удаления профиля няни:", deleteNannyError)
        throw deleteNannyError
      }
      console.log("Профиль няни удален")
    }

    // Получаем профиль родителя, если есть
    const { data: parentProfile } = await supabase
      .from('parent_profiles')
      .select('id')
      .eq('user_id', id)
      .single()

    if (parentProfile) {
      console.log("Найден профиль родителя, удаляем связанные данные...")
      
      // Удаляем детей
      const { error: deleteChildrenError } = await supabase
        .from('children')
        .delete()
        .eq('parent_profile_id', parentProfile.id)

      if (deleteChildrenError) {
        console.error("Ошибка при удалении детей:", deleteChildrenError)
        throw deleteChildrenError
      }
      console.log("Удалены данные о детях")

      // Удаляем заявки
      const { error: deleteAppointmentsError } = await supabase
        .from('appointments')
        .delete()
        .eq('parent_id', parentProfile.id)

      if (deleteAppointmentsError) {
        console.error("Ошибка при удалении заявок:", deleteAppointmentsError)
        throw deleteAppointmentsError
      }
      console.log("Удалены заявки")

      // Удаляем профиль родителя
      const { error: deleteParentError } = await supabase
        .from('parent_profiles')
        .delete()
        .eq('user_id', id)

      if (deleteParentError) {
        console.error("Ошибка удаления профиля родителя:", deleteParentError)
        throw deleteParentError
      }
      console.log("Профиль родителя удален")
    }

    // Удаляем роли пользователя
    const { error: deleteRolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', id)

    if (deleteRolesError) {
      console.error("Ошибка при удалении ролей:", deleteRolesError)
      throw deleteRolesError
    }
    console.log("Удалены роли пользователя")

    // Удаляем основной профиль
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (deleteProfileError) {
      console.error("Ошибка удаления профиля:", deleteProfileError)
      throw deleteProfileError
    }
    console.log("Удален основной профиль")

    // Удаляем пользователя из auth.users
    const { error: deleteError } = await supabase.auth.admin.deleteUser(id)
    
    if (deleteError) {
      console.error("Ошибка удаления из auth.users:", deleteError)
      throw deleteError
    }

    console.log("Пользователь успешно удален из auth.users")
    console.log("=== Процесс удаления пользователя завершен успешно ===")

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