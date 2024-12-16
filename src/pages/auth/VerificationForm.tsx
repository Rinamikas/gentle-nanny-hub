import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { testAuthFlow } from "@/tests/auth-flow.test";

interface VerificationFormProps {
  email: string;
  onVerificationSuccess: () => void;
}

const VerificationForm = ({ email, onVerificationSuccess }: VerificationFormProps) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerification = async () => {
    setIsLoading(true);
    console.log("=== Starting verification process ===");
    console.log("Email:", email);
    console.log("OTP:", otp);

    try {
      // 1. Проверяем код в базе данных
      console.log("1. Checking verification code");
      const { hasValidCode } = await testAuthFlow(email, otp);
      console.log("Verification code check result:", { hasValidCode });

      if (!hasValidCode) {
        throw new Error("Неверный код или срок его действия истек");
      }

      // 2. Создаем сессию через Supabase Auth
      console.log("2. Creating session with custom auth");
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: `${otp}_${Date.now()}`, // Используем код + timestamp как временный пароль
        options: {
          data: {
            email: email
          }
        }
      });

      console.log("3. SignUp response:", { data: signUpData, error: signUpError });

      if (signUpError) {
        // Если пользователь уже существует, пробуем войти
        if (signUpError.message.includes("User already registered")) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: `${otp}_${Date.now()}`,
          });

          console.log("4. SignIn response:", { data: signInData, error: signInError });
          
          if (signInError) {
            console.error("5. SignIn error:", signInError);
            throw signInError;
          }
        } else {
          console.error("6. SignUp error:", signUpError);
          throw signUpError;
        }
      }

      // 3. Проверяем создание сессии
      console.log("7. Checking session after verification");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("8. Current session:", session);
      
      if (sessionError) {
        console.error("9. Session error:", sessionError);
        throw new Error("Ошибка при создании сессии");
      }

      if (!session) {
        console.error("10. No session created");
        throw new Error("Сессия не была создана");
      }

      // 4. Обновляем статус кода в БД
      console.log("11. Updating verification code status");
      const { error: updateError } = await supabase
        .from("verification_codes")
        .update({ status: 'verified' })
        .eq("email", email)
        .eq("code", otp);

      if (updateError) {
        console.error("12. Status update error:", updateError);
        throw new Error("Ошибка при обновлении статуса кода");
      }

      console.log("=== Verification completed successfully ===");
      toast({
        title: "Успешно!",
        description: "Вы успешно авторизовались",
      });

      onVerificationSuccess();

    } catch (error: any) {
      console.error("=== Verification failed ===");
      console.error("Error details:", error);
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось проверить код",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => {
            console.log("OTP value changed:", value);
            setOtp(value);
          }}
          className="gap-2 justify-center"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button
        onClick={handleVerification}
        className="w-full"
        disabled={isLoading || otp.length !== 6}
      >
        {isLoading ? "Проверка..." : "Подтвердить"}
      </Button>
    </div>
  );
};

export default VerificationForm;