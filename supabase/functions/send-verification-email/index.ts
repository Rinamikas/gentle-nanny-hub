import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string[];
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Получен запрос на отправку email");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY не настроен");
      throw new Error("RESEND_API_KEY не настроен");
    }

    const { to, code }: EmailRequest = await req.json();
    
    console.log("Отправка кода верификации на:", to);
    
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Nanny System <nanny@rnmka.ru>",
        to,
        subject: "Код подтверждения",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Код подтверждения</title>
            </head>
            <body>
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #8B5CF6; text-align: center;">Nanny Management System</h1>
                <p style="text-align: center;">Ваш код подтверждения:</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
                  ${code}
                </div>
                <p style="text-align: center; color: #6b7280;">Код действителен в течение 10 минут</p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const responseData = await res.json();
    console.log("Ответ от Resend API:", responseData);

    if (!res.ok) {
      console.error("Ошибка от Resend API:", responseData);
      throw new Error(responseData.message || "Не удалось отправить email");
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Ошибка в функции send-verification-email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Проверьте настройку RESEND_API_KEY"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);