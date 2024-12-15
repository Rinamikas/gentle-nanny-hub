import { supabase } from "@/integrations/supabase/client";

export async function testVerificationFlow() {
  const testEmail = "fnormal@gmail.com";
  
  console.log("=== Starting Verification Flow Test ===");

  try {
    // Получаем код из параметров или используем тестовый
    const { data: latestCode, error: latestError } = await supabase
      .from('verification_codes')
      .select('code')
      .eq('email', testEmail)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestError) {
      console.error("Error getting latest code:", latestError);
      throw latestError;
    }

    console.log("Latest code found:", latestCode);

    // Проверяем все коды для этого email
    console.log("1. Checking all pending codes for email:", testEmail);
    const { data: allCodes, error: allCodesError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', testEmail)
      .eq('status', 'pending');

    if (allCodesError) {
      console.error("Error checking all codes:", allCodesError);
      throw allCodesError;
    }
    console.log("All pending codes for email:", allCodes);

    // Проверяем RLS политики
    console.log("2. Checking RLS policies...");
    const { data: policies, error: policiesError } = await supabase
      .rpc('check_verification_code_access', {
        p_email: testEmail
      });

    if (policiesError) {
      console.error("Error checking RLS policies:", policiesError);
      throw policiesError;
    }
    console.log("RLS policies check result:", policies);

    console.log("=== Test Completed Successfully ===");
    return true;
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
}