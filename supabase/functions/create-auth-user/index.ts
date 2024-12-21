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

    const { email, code } = await req.json()
    console.log("=== Начало создания пользователя ===")
    console.log("Email:", email)

    // Проверяем код верификации
    const { data: isValid, error: verifyError } = await supabase
      .rpc('check_verification_code', {
        p_email: email,
        p_code: code
      })

    if (verifyError || !isValid) {
      console.error("Ошибка проверки кода:", verifyError)
      throw new Error("Неверный код верификации")
    }

    // Генерируем случайный пароль
    const password = Math.random().toString(36).slice(-8)
    console.log("Сгенерирован пароль для пользователя")

    // Создаем пользователя в auth.users
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (createError) {
      console.error("Ошибка создания пользователя:", createError)
      throw createError
    }

    console.log("Пользователь успешно создан:", user.id)

    // Обновляем статус кода верификации
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ status: 'verified' })
      .eq('email', email)
      .eq('code', code)

    if (updateError) {
      console.error("Ошибка обновления статуса кода:", updateError)
    }

    return new Response(
      JSON.stringify({ 
        user: user,
        password: password 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error("Ошибка:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})