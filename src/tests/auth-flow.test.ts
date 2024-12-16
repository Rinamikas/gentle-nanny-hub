import { supabase } from "@/integrations/supabase/client";

export async function testAuthFlow(email: string, code: string) {
  console.log("=== Starting Auth Flow Test ===");
  
  try {
    // 1. Проверяем статус текущей сессии
    console.log("1. Checking current session");
    const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
    console.log("Initial session:", initialSession);
    if (sessionError) throw sessionError;

    // 2. Проверяем код в базе данных
    console.log("2. Checking verification code in database");
    const { data: codes, error: codesError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());
    
    console.log("Found codes:", codes);
    if (codesError) throw codesError;

    // 3. Проверяем время жизни кода
    if (codes && codes.length > 0) {
      const expiresAt = new Date(codes[0].expires_at);
      const now = new Date();
      console.log("Code expires at:", expiresAt);
      console.log("Current time:", now);
      console.log("Time until expiration:", expiresAt.getTime() - now.getTime(), "ms");
    }

    return {
      hasValidCode: codes && codes.length > 0,
      initialSession
    };
  } catch (error) {
    console.error("Auth flow test failed:", error);
    throw error;
  }
}