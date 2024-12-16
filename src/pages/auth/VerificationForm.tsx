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

      // 2. Пробуем создать нового пользователя
      console.log("2. Attempting to create new user");
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: otp, // Используем код верификации как пароль
        options: {
          data: {
            email: email
          }
        }
      });

      console.log("3. SignUp response:", { data: signUpData, error: signUpError });

      // 3. Если пользователь уже существует, обновляем пароль и входим
      if (signUpError && signUpError.message.includes("User already registered")) {
        console.log("4. User exists, updating password and signing in");
        
        // Сначала входим с текущим кодом как паролем
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: otp,
        });

        console.log("5. SignIn response:", { data: signInData, error: signInError });
        
        if (signInError) {
          console.error("6. SignIn error:", signInError);
          throw signInError;
        }

        // После успешного входа обновляем пароль на новый код
        const { error: updateError } = await supabase.auth.updateUser({
          password: otp
        });

        if (updateError) {
          console.error("7. Password update error:", updateError);
          throw updateError;
        }

        console.log("8. Password successfully updated");
      } else if (signUpError) {
        console.error("9. SignUp error:", signUpError);
        throw signUpError;
      }

      // 4. Проверяем создание сессии
      console.log("10. Checking session after verification");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("11. Current session:", session);
      
      if (sessionError) {
        console.error("12. Session error:", sessionError);
        throw new Error("Ошибка при создании сессии");
      }

      if (!session) {
        console.error("13. No session created");
        throw new Error("Сессия не была создана");
      }

      // 5. Обновляем статус кода в БД
      console.log("14. Updating verification code status");
      const { error: updateError } = await supabase
        .from("verification_codes")
        .update({ status: 'verified' })
        .eq("email", email)
        .eq("code", otp);

      if (updateError) {
        console.error("15. Status update error:", updateError);
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