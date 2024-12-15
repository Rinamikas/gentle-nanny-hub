import { supabase } from "@/integrations/supabase/client";

export async function testVerificationFlow() {
  const email = "test@example.com";
  const code = "123456";
  
  console.log("=== Starting Verification Flow Test ===");

  // Очистка тестовых данных
  console.log("1. Cleaning up test data...");
  const { error: cleanupError } = await supabase
    .from('verification_codes')
    .delete()
    .eq('email', email);
  
  if (cleanupError) {
    console.error("Cleanup error:", cleanupError);
    return;
  }

  // Создание нового кода
  console.log("2. Creating new verification code...");
  const { data: insertData, error: insertError } = await supabase
    .from('verification_codes')
    .insert({
      email,
      code,
      expires_at: new Date(Date.now() + 30 * 60000).toISOString(),
      status: 'pending'
    })
    .select();

  if (insertError) {
    console.error("Insert error:", insertError);
    return;
  }
  console.log("Insert result:", insertData);

  // Проверка создания кода
  console.log("3. Checking if code was created...");
  const { data: allCodes, error: selectAllError } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('email', email);

  if (selectAllError) {
    console.error("Select all error:", selectAllError);
    return;
  }
  console.log("All codes for email:", allCodes);

  // Проверка конкретного кода
  console.log("4. Checking specific code...");
  const { data: codes, error: selectError } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .gt('expires_at', new Date().toISOString());

  if (selectError) {
    console.error("Select error:", selectError);
    return;
  }
  console.log("Found codes:", codes);

  console.log("=== Test Complete ===");
}