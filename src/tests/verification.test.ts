import { supabase } from "@/integrations/supabase/client";

export async function testVerificationFlow() {
  const testEmail = "test@example.com";
  const testCode = "123456";
  
  console.log("=== Starting Verification Flow Test ===");

  try {
    // Очистка тестовых данных
    console.log("1. Cleaning up test data...");
    const { error: cleanupError } = await supabase
      .from('verification_codes')
      .delete()
      .eq('email', testEmail);
    
    if (cleanupError) {
      console.error("Cleanup error:", cleanupError);
      throw cleanupError;
    }
    console.log("Cleanup completed successfully");

    // Создание нового кода
    console.log("2. Creating new verification code...");
    const { data: insertData, error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        email: testEmail,
        code: testCode,
        expires_at: new Date(Date.now() + 30 * 60000).toISOString(),
        status: 'pending'
      })
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }
    console.log("New code created:", insertData);

    // Проверка создания кода
    console.log("3. Checking if code exists...");
    const { data: codes, error: selectError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', testEmail)
      .eq('code', testCode)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (selectError) {
      console.error("Select error:", selectError);
      throw selectError;
    }
    console.log("Found codes:", codes);

    // Проверка верификации кода
    console.log("4. Testing code verification...");
    const { data: verifyData, error: verifyError } = await supabase
      .from('verification_codes')
      .update({ status: 'verified' })
      .eq('email', testEmail)
      .eq('code', testCode)
      .select();

    if (verifyError) {
      console.error("Verification error:", verifyError);
      throw verifyError;
    }
    console.log("Code verification result:", verifyData);

    console.log("=== Test Completed Successfully ===");
    return true;
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
}