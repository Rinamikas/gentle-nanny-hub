import { supabase } from "@/integrations/supabase/client";

export async function testVerificationFlow() {
  const testEmail = "fnormal@gmail.com";
  const testCode = "713474"; // Используем код из логов
  
  console.log("=== Starting Verification Flow Test ===");

  try {
    // Сначала проверим все коды для этого email
    console.log("1. Checking all codes for email:", testEmail);
    const { data: allCodes, error: allCodesError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', testEmail);

    if (allCodesError) {
      console.error("Error checking all codes:", allCodesError);
      throw allCodesError;
    }
    console.log("All codes for email:", allCodes);

    // Теперь проверим конкретный код
    console.log("2. Checking specific code:", testCode);
    const { data: codes, error: selectError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', testEmail)
      .eq('code', testCode);

    if (selectError) {
      console.error("Select error:", selectError);
      throw selectError;
    }
    console.log("Found codes for specific code:", codes);

    // Если код найден, проверим его статус и срок действия
    if (codes && codes.length > 0) {
      const code = codes[0];
      console.log("Found code details:", {
        id: code.id,
        status: code.status,
        expires_at: code.expires_at,
        created_at: code.created_at
      });
    } else {
      console.log("No codes found matching criteria");
    }

    console.log("=== Test Completed Successfully ===");
    return true;
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
}