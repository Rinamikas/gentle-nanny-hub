import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { to, code }: EmailRequest = await req.json();
    
    console.log("Attempting to send verification email to:", to);
    
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Nanny System <nanny@rnmka.ru>",
        to: [to],
        subject: "Код подтверждения",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Код подтверждения</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f5;
                }
                .container {
                  max-width: 600px;
                  margin: 2rem auto;
                  padding: 2rem;
                  background-color: white;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                  text-align: center;
                  margin-bottom: 2rem;
                }
                .logo {
                  color: #8B5CF6;
                  font-size: 1.5rem;
                  font-weight: bold;
                  margin-bottom: 1rem;
                }
                .code {
                  text-align: center;
                  font-size: 2rem;
                  letter-spacing: 0.5rem;
                  color: #8B5CF6;
                  background-color: #f4f4f5;
                  padding: 1rem;
                  border-radius: 4px;
                  margin: 2rem 0;
                }
                .footer {
                  text-align: center;
                  color: #6b7280;
                  font-size: 0.875rem;
                  margin-top: 2rem;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">Nanny Management System</div>
                  <h1 style="color: #1f2937; font-size: 1.5rem; margin-bottom: 1rem;">
                    Код подтверждения для входа
                  </h1>
                  <p style="color: #6b7280;">
                    Используйте этот код для подтверждения вашего email адреса
                  </p>
                </div>
                
                <div class="code">
                  ${code}
                </div>
                
                <p style="color: #6b7280; text-align: center;">
                  Код действителен в течение 30 минут
                </p>
                
                <div class="footer">
                  <p>Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const responseData = await res.json();
    console.log("Resend API response:", responseData);

    if (!res.ok) {
      console.error("Error from Resend API:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check if RESEND_API_KEY is properly configured"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);