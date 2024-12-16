import { supabase } from "@/integrations/supabase/client";

export async function testAuthFlow(email: string, code: string) {
  console.log("=== Starting Auth Flow Test ===");
  
  try {
    // 1. Проверяем статус текущей сессии
    console.log("1. Checking current session");
    const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
    console.log("Initial session:", initialSession);
    if (sessionError) throw sessionError;

    // 2. Проверяем код в базе данных через RPC
    console.log("2. Checking verification code using RPC");
    const { data: hasValidCode, error: rpcError } = await supabase
      .rpc('check_verification_code', {
        p_email: email,
        p_code: code
      });
    
    console.log("Verification check result:", hasValidCode);
    if (rpcError) throw rpcError;

    return {
      hasValidCode: !!hasValidCode,
      initialSession
    };
  } catch (error) {
    console.error("Auth flow test failed:", error);
    throw error;
  }
}