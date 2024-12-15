import { supabase } from "@/integrations/supabase/client";

export async function testVerificationFlow() {
  const testEmail = "fnormal@gmail.com";
  
  console.log("=== Starting Verification Flow Test ===");

  try {
    // Получаем код из параметров или используем тестовый
    console.log("1. Checking latest verification code for:", testEmail);
    const { data: latestCode, error: latestError } = await supabase
      .from('verification_codes')
      .select('code')
      .eq('email', testEmail)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) {
      console.error("Error getting latest code:", latestError);
      throw latestError;
    }

    console.log("Latest code found:", latestCode || 'No pending codes found');

    // Проверяем все коды для этого email
    console.log("2. Checking all pending codes for email:", testEmail);
    const { data: allCodes, error: allCodesError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', testEmail)
      .eq('status', 'pending');

    if (allCodesError) {
      console.error("Error checking all codes:", allCodesError);
      throw allCodesError;
    }
    
    if (!allCodes || allCodes.length === 0) {
      console.log("No active codes found for:", testEmail);
      return false;
    }
    
    console.log("All pending codes for email:", allCodes);

    // Проверяем RLS политики
    console.log("3. Checking RLS policies...");
    const { data: hasAccess, error: accessError } = await supabase
      .rpc('check_verification_code_access', {
        p_email: testEmail
      });

    if (accessError) {
      console.error("Error checking RLS policies:", accessError);
      throw accessError;
    }
    console.log("RLS policies check result:", hasAccess);

    console.log("=== Test Completed Successfully ===");
    return true;
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
}