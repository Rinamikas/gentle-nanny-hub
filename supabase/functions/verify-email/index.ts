import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerificationRequest {
  email: string;
  code?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, code } = await req.json() as VerificationRequest

    if (!email) {
      throw new Error('Email is required')
    }

    // Если код не предоставлен, генерируем и сохраняем новый
    if (!code) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 30 * 60000) // 30 минут

      const { error: insertError } = await supabaseClient
        .from('verification_codes')
        .insert({
          email,
          code: verificationCode,
          expires_at: expiresAt.toISOString(),
        })

      if (insertError) throw insertError

      return new Response(
        JSON.stringify({ message: 'Verification code sent' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Проверяем код
    const { data: codes, error: selectError } = await supabaseClient
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (selectError) throw selectError

    if (!codes || codes.length === 0) {
      throw new Error('Invalid or expired verification code')
    }

    // Обновляем статус кода
    const { error: updateError } = await supabaseClient
      .from('verification_codes')
      .update({ status: 'verified' })
      .eq('id', codes[0].id)

    if (updateError) throw updateError

    // Создаем сессию для пользователя
    const { data: authData, error: signInError } = await supabaseClient.auth.signInWithOtp({
      email,
    })

    if (signInError) throw signInError

    return new Response(
      JSON.stringify({ message: 'Verification successful', session: authData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})