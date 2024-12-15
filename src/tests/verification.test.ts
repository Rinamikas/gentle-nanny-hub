import { supabase } from "@/integrations/supabase/client";

export async function testVerificationFlow() {
  const testEmail = "fnormal@gmail.com";
  const testCode = "394145"; // Используем существующий код из базы
  
  console.log("=== Starting Verification Flow Test ===");

  try {
    // Проверка существующего кода
    console.log("1. Testing code verification...");
    const { data: codes, error: selectError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', testEmail)
      .eq('code', testCode)
      .eq('status', 'pending');

    if (selectError) {
      console.error("Select error:", selectError);
      throw selectError;
    }
    console.log("Found codes:", codes);

    // Проверяем срок действия
    if (codes && codes.length > 0) {
      const code = codes[0];
      const now = new Date();
      const expiresAt = new Date(code.expires_at);
      console.log("Expiration check:", {
        now: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isExpired: now > expiresAt
      });
    }

    console.log("=== Test Completed Successfully ===");
    return true;
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
}