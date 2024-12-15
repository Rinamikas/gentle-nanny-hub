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
          <div>
            <h1>Код подтверждения для входа</h1>
            <p>Ваш код подтверждения: <strong>${code}</strong></p>
            <p>Код действителен в течение 30 минут.</p>
          </div>
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
  } catch (error) {
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